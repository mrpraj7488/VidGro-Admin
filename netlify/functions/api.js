import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();

// In-memory runtime overrides
const runtimeOverrides = {
  supabaseUrl: null,
  supabaseAnonKey: null,
};

// Apply CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Runtime Configuration Management
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Test endpoint for API route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API route is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// ----- Helpers for Supabase Storage backup -----
const BACKUP_BUCKET = process.env.SUPABASE_BACKUP_BUCKET || 'database-backup';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.MOBILE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

const ensureBucketExists = async (supabase, bucket = BACKUP_BUCKET) => {
  try {
    // Try listing buckets if available; otherwise assume it exists
    if (typeof supabase.storage.listBuckets === 'function') {
      const { data: listResult, error: listError } = await supabase.storage.listBuckets();
      if (!listError && listResult && listResult.some(b => b.name === bucket)) {
        return { ok: true, created: false };
      }
    } else {
      // Older SDKs may not support listBuckets; don't fail backup on this
      return { ok: true, created: false };
    }
  } catch (_) {
    // Ignore and try create
  }

  try {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && !String(error.message || '').includes('already exists')) {
      return { ok: false, error };
    }
    return { ok: true, created: true };
  } catch (e) {
    // If create fails (likely due to permissions), continue assuming it exists
    return { ok: true, created: false };
  }
};

const getBackupUrls = async (supabase, bucket = BACKUP_BUCKET, objectPath) => {
  // Try public URL first
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  let publicUrl = pub?.publicUrl || null;

  // If not public, generate signed URL (7 days)
  let signedUrl = null;
  if (!publicUrl) {
    const { data: signed } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(objectPath, 60 * 60 * 24 * 7);
    signedUrl = signed?.signedUrl || null;
  }
  return { publicUrl, signedUrl };
};

// ----- Enhanced public endpoint for client runtime config -----
app.get('/client-runtime-config', async (req, res) => {
  try {
    const environment = req.headers['x-env'] || req.query.env || 'production';
    const appVersion = req.headers['x-app-version'];
    const clientIP = getClientIP(req);
    const cacheKey = `public-config-${environment}`;
    
    console.log(`[CONFIG ACCESS] ${clientIP} requested ${environment} config (v${appVersion || 'unknown'})`);
    
    const cached = configCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'private, max-age=300'
      });
      return res.json({ data: cached.data, cached: true, timestamp: cached.timestamp, environment });
    }

    // Resolve Supabase values
    const resolvedSupabaseUrl = runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co';
    const resolvedSupabaseAnonKey = runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.LRmGLu1OAcJza-eEPSIJUaFAyhxkdAGrbyRFRGSWpVw';

    if (resolvedSupabaseUrl && resolvedSupabaseAnonKey) {
      const cfg = {
        supabase: { url: resolvedSupabaseUrl, anonKey: resolvedSupabaseAnonKey },
        admob: {
          appId: process.env.ADMOB_APP_ID || 'ca-app-pub-test',
          bannerId: process.env.ADMOB_BANNER_ID || 'ca-app-pub-test-banner',
          interstitialId: process.env.ADMOB_INTERSTITIAL_ID || 'ca-app-pub-test-interstitial',
          rewardedId: process.env.ADMOB_REWARDED_ID || 'ca-app-pub-test-rewarded',
        },
        features: { coinsEnabled: true, adsEnabled: true, vipEnabled: true, referralsEnabled: true, analyticsEnabled: true },
        app: { minVersion: '1.0.0', forceUpdate: false, maintenanceMode: false, apiVersion: 'v1' },
        security: { allowEmulators: true, allowRooted: false, requireSignatureValidation: false, adBlockDetection: true },
        metadata: { configVersion: '1.0.0', lastUpdated: new Date().toISOString(), ttl: 3600 },
      };

      configCache.set(cacheKey, { data: cfg, timestamp: Date.now() });
      res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-XSS-Protection': '1; mode=block', 'Cache-Control': 'private, max-age=300' });
      return res.json({ data: cfg, cached: false, environment });
    }

    // Fallback configuration
    const productionConfig = {
      supabase: { 
        url: runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co',
        anonKey: runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.LRmGLu1OAcJza-eEPSIJUaFAyhxkdAGrbyRFRGSWpVw'
      },
      admob: { 
        appId: process.env.ADMOB_APP_ID || 'ca-app-pub-2892152842024866~2841739969',
        bannerId: process.env.ADMOB_BANNER_ID || 'ca-app-pub-2892152842024866/6180566789',
        interstitialId: process.env.ADMOB_INTERSTITIAL_ID || 'ca-app-pub-2892152842024866/2604283857',
        rewardedId: process.env.ADMOB_REWARDED_ID || 'ca-app-pub-2892152842024866/2049185437'
      },
      features: { coinsEnabled: true, adsEnabled: true, vipEnabled: true, referralsEnabled: true, analyticsEnabled: true },
      app: { minVersion: '1.0.0', forceUpdate: false, maintenanceMode: false, apiVersion: 'v1' },
      security: { allowEmulators: process.env.NODE_ENV === 'development', allowRooted: false, requireSignatureValidation: process.env.NODE_ENV === 'production', adBlockDetection: true },
      metadata: { configVersion: '1.0.0', lastUpdated: new Date().toISOString(), ttl: 3600 },
    };
    
    if (productionConfig.supabase.url && productionConfig.supabase.anonKey) {
      res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-XSS-Protection': '1; mode=block', 'Cache-Control': 'private, max-age=300' });
      return res.json({ data: productionConfig, cached: false, environment });
    }

    console.error('[CONFIG ERROR] No valid Supabase configuration available');
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Application configuration not properly set up. Please contact administrator.'
    });
  } catch (error) {
    console.error('Error fetching client runtime config:', error);
    return res.status(500).json({ error: 'Failed to fetch runtime configuration' });
  }
});

// Backward compatibility endpoint for mobile app
app.get('/api/client-runtime-config', async (req, res) => {
  // Call the same logic as the main endpoint
  try {
    const environment = req.headers['x-env'] || req.query.env || 'production';
    const appVersion = req.headers['x-app-version'];
    const clientIP = getClientIP(req);
    const cacheKey = `public-config-${environment}`;
    
    console.log(`[CONFIG ACCESS - API] ${clientIP} requested ${environment} config (v${appVersion || 'unknown'})`);
    
    const cached = configCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'private, max-age=300'
      });
      return res.json({ data: cached.data, cached: true, timestamp: cached.timestamp, environment });
    }

    // Resolve Supabase values
    const resolvedSupabaseUrl = runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co';
    const resolvedSupabaseAnonKey = runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.LRmGLu1OAcJza-eEPSIJUaFAyhxkdAGrbyRFRGSWpVw';

    if (resolvedSupabaseUrl && resolvedSupabaseAnonKey) {
      const cfg = {
        supabase: { url: resolvedSupabaseUrl, anonKey: resolvedSupabaseAnonKey },
        admob: {
          appId: process.env.ADMOB_APP_ID || 'ca-app-pub-test',
          bannerId: process.env.ADMOB_BANNER_ID || 'ca-app-pub-test-banner',
          interstitialId: process.env.ADMOB_INTERSTITIAL_ID || 'ca-app-pub-test-interstitial',
          rewardedId: process.env.ADMOB_REWARDED_ID || 'ca-app-pub-test-rewarded',
        },
        features: { coinsEnabled: true, adsEnabled: true, vipEnabled: true, referralsEnabled: true, analyticsEnabled: true },
        app: { minVersion: '1.0.0', forceUpdate: false, maintenanceMode: false, apiVersion: 'v1' },
        security: { allowEmulators: true, allowRooted: false, requireSignatureValidation: false, adBlockDetection: true },
        metadata: { configVersion: '1.0.0', lastUpdated: new Date().toISOString(), ttl: 3600 },
      };

      configCache.set(cacheKey, { data: cfg, timestamp: Date.now() });
      res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-XSS-Protection': '1; mode=block', 'Cache-Control': 'private, max-age=300' });
      return res.json({ data: cfg, cached: false, environment });
    }

    // Fallback configuration
    const productionConfig = {
      supabase: { 
        url: runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co',
        anonKey: runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.LRmGLu1OAcJza-eEPSIJUaFAyhxkdAGrbyRFRGSWpVw'
      },
      admob: { 
        appId: process.env.ADMOB_APP_ID || 'ca-app-pub-2892152842024866~2841739969',
        bannerId: process.env.ADMOB_BANNER_ID || 'ca-app-pub-2892152842024866/6180566789',
        interstitialId: process.env.ADMOB_INTERSTITIAL_ID || 'ca-app-pub-2892152842024866/2604283857',
        rewardedId: process.env.ADMOB_REWARDED_ID || 'ca-app-pub-2892152842024866/2049185437'
      },
      features: { coinsEnabled: true, adsEnabled: true, vipEnabled: true, referralsEnabled: true, analyticsEnabled: true },
      app: { minVersion: '1.0.0', forceUpdate: false, maintenanceMode: false, apiVersion: 'v1' },
      security: { allowEmulators: process.env.NODE_ENV === 'development', allowRooted: false, requireSignatureValidation: process.env.NODE_ENV === 'production', adBlockDetection: true },
      metadata: { configVersion: '1.0.0', lastUpdated: new Date().toISOString(), ttl: 3600 },
    };
    
    if (productionConfig.supabase.url && productionConfig.supabase.anonKey) {
      res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-XSS-Protection': '1; mode=block', 'Cache-Control': 'private, max-age=300' });
      return res.json({ data: productionConfig, cached: false, environment });
    }

    console.error('[CONFIG ERROR] No valid Supabase configuration available');
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Application configuration not properly set up. Please contact administrator.'
    });
  } catch (error) {
    console.error('Error fetching client runtime config:', error);
    return res.status(500).json({ error: 'Failed to fetch runtime configuration' });
  }
});

// Admin endpoint to sync environment variables
app.post('/admin/env-sync', async (req, res) => {
  try {
    const {
      MOBILE_SUPABASE_URL,
      MOBILE_SUPABASE_ANON_KEY,
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      ADMOB_APP_ID,
      ADMOB_BANNER_ID,
      ADMOB_INTERSTITIAL_ID,
      ADMOB_REWARDED_ID,
    } = req.body || {};

    const newUrl = MOBILE_SUPABASE_URL || SUPABASE_URL;
    const newAnon = MOBILE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

    if (!newUrl || !newAnon) {
      return res.status(400).json({ success: false, message: 'Missing SUPABASE URL or ANON KEY' });
    }

    // Update in-memory overrides
    runtimeOverrides.supabaseUrl = newUrl;
    runtimeOverrides.supabaseAnonKey = newAnon;
    
    // Update AdMob environment variables if provided
    if (ADMOB_APP_ID) process.env.ADMOB_APP_ID = ADMOB_APP_ID;
    if (ADMOB_BANNER_ID) process.env.ADMOB_BANNER_ID = ADMOB_BANNER_ID;
    if (ADMOB_INTERSTITIAL_ID) process.env.ADMOB_INTERSTITIAL_ID = ADMOB_INTERSTITIAL_ID;
    if (ADMOB_REWARDED_ID) process.env.ADMOB_REWARDED_ID = ADMOB_REWARDED_ID;

    // Clear config cache
    for (const key of Array.from(configCache.keys())) {
      if (key.startsWith('public-config-')) configCache.delete(key);
    }

    return res.json({ success: true, message: 'Environment synchronized', overrides: runtimeOverrides });
  } catch (error) {
    console.error('env-sync failed:', error);
    return res.status(500).json({ success: false, message: 'Failed to synchronize environment' });
  }
});

// Backup download endpoint
app.get('/backup', (req, res) => {
  try {
    const { token, filename = 'backup.sql' } = req.query || {};
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token' });
    }
    const sqlContent = Buffer.from(token, 'base64').toString('utf8');
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(sqlContent);
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to prepare download' });
  }
});

// Database backup endpoint (serverless-friendly)
app.post('/api/admin/database-backup', async (req, res) => {
  try {
    const { backupType = 'full', customName = '' } = req.body || {};

    // Resolve Supabase settings (use env or fallbacks)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.MOBILE_SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co';
    
    // Minimal SQL header (serverless-safe)
    let sqlContent = `-- VidGro Database Backup (Serverless)\n` +
      `-- Created: ${new Date().toISOString()}\n` +
      `-- Type: ${backupType}\n` +
      `-- Supabase: ${supabaseUrl}\n` +
      `\nBEGIN;\n\n` +
      `-- NOTE: This is a lightweight serverless backup stub.\n` +
      `-- For full schema/data export, run the backup from a trusted server or Supabase dashboard.\n` +
      `-- The mobile app will work using runtime configuration.\n\nCOMMIT;\n`;

    // Upload to Supabase Storage using service role
    const supabaseAdmin = getSupabaseAdmin();
    let publicUrl = null;
    let signedUrl = null;
    let storagePath = null;

    if (supabaseAdmin) {
      await ensureBucketExists(supabaseAdmin, BACKUP_BUCKET);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeName = customName ? String(customName).replace(/[^a-zA-Z0-9-_]/g, '_') : '';
      const filename = `backup_${backupType}_${timestamp}${safeName ? '_' + safeName : ''}.sql`;
      storagePath = `${filename}`;

      const { error: uploadError } = await supabaseAdmin
        .storage
        .from(BACKUP_BUCKET)
        .upload(storagePath, Buffer.from(sqlContent, 'utf8'), {
          contentType: 'application/sql',
          upsert: true
        });

      if (!uploadError) {
        const urls = await getBackupUrls(supabaseAdmin, BACKUP_BUCKET, storagePath);
        publicUrl = urls.publicUrl;
        signedUrl = urls.signedUrl;
      }
    }

    // Fallback: in-memory download link (if storage not configured)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = customName ? String(customName).replace(/[^a-zA-Z0-9-_]/g, '_') : '';
    const filename = `backup_${backupType}_${timestamp}${safeName ? '_' + safeName : ''}.sql`;
    const token = Buffer.from(sqlContent, 'utf8').toString('base64');
    const filePath = `/.netlify/functions/api/backup?filename=${encodeURIComponent(filename)}&token=${encodeURIComponent(token)}`;

    return res.json({
      success: true,
      message: 'Backup generated',
      filename,
      filePath, // in-memory download link
      storage: {
        bucket: BACKUP_BUCKET,
        uploaded: Boolean(publicUrl || signedUrl),
        publicUrl,
        signedUrl,
        path: storagePath
      },
      size: (sqlContent.length / 1024).toFixed(2),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cacheSize: configCache.size,
    environment: process.env.NODE_ENV || 'development',
    version: '2.1.0',
    platform: 'netlify-functions'
  });
});

// Test endpoint to check environment
app.get('/test-env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV === 'development',
    timestamp: new Date().toISOString(),
    platform: 'netlify-functions'
  });
});

// Export the serverless function handler
export const handler = serverless(app);
