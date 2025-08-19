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
    const supabaseAdmin = getSupabaseAdmin();

    // Controls
    const MAX_ROWS_PER_TABLE = Number(process.env.BACKUP_MAX_ROWS || 2000);
    const PAGE_SIZE = 1000;

    // Helpers to safely format SQL
    const qIdent = (name) => '"' + String(name).replace(/"/g, '""') + '"';
    const qLit = (val) => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
      const s = typeof val === 'string' ? val : JSON.stringify(val);
      return '\'' + s.replace(/'/g, "''") + '\'';
    };

    // Try to detect existing public tables by probing a candidate list
    const candidateTables = [
      'profiles',
      'videos',
      'coin_transactions',
      'runtime_config',
      'admin_audit_logs',
      'bug_reports'
    ];
    const presentTables = [];

    if (supabaseAdmin) {
      for (const t of candidateTables) {
        try {
          const { error } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true });
          if (!error) presentTables.push(t);
        } catch (_) {}
      }
    }

    // Build SQL
    let parts = [];
    parts.push(`-- VidGro Database Backup\n-- Created: ${new Date().toISOString()}\n-- Type: ${backupType}\n-- Supabase: ${supabaseUrl}`);
    parts.push('SET statement_timeout = 0;');
    parts.push("SET lock_timeout = 0;");
    parts.push("SET client_encoding = 'UTF8';");
    parts.push("SET standard_conforming_strings = on;");
    parts.push('BEGIN;');

    // Attempt to include schema via RPC helper functions if available
    const trySchemaForTable = async (table) => {
      if (!supabaseAdmin) return [];
      const schemaChunks = [];
      try {
        const { data: tbl, error: errTbl } = await supabaseAdmin.rpc('get_table_structure', { table_name: table });
        if (!errTbl && Array.isArray(tbl)) schemaChunks.push(...tbl.map(r => r.create_statement).filter(Boolean));
      } catch (_) {}
      try {
        const { data: idx, error: errIdx } = await supabaseAdmin.rpc('get_table_indexes', { table_name: table });
        if (!errIdx && Array.isArray(idx)) schemaChunks.push(...idx.map(r => r.create_statement).filter(Boolean));
      } catch (_) {}
      try {
        const { data: trg, error: errTrg } = await supabaseAdmin.rpc('get_table_triggers', { table_name: table });
        if (!errTrg && Array.isArray(trg)) schemaChunks.push(...trg.map(r => r.create_statement).filter(Boolean));
      } catch (_) {}
      try {
        const { data: pol, error: errPol } = await supabaseAdmin.rpc('get_table_policies', { table_name: table });
        if (!errPol && Array.isArray(pol)) schemaChunks.push(...pol.map(r => r.create_statement).filter(Boolean));
      } catch (_) {}
      return schemaChunks;
    };

    // Dump schema (best-effort)
    for (const t of presentTables) {
      parts.push(`\n-- Schema for ${t}`);
      const schemaParts = await trySchemaForTable(t);
      if (schemaParts.length > 0) {
        parts.push(...schemaParts);
      } else {
        // Fallback minimal table stub if schema RPC not available
        parts.push(`-- NOTE: Schema function not available for ${t}. Create table manually in restore env.`);
      }
    }

    // Dump data with INSERT statements (capped)
    for (const t of presentTables) {
      parts.push(`\n-- Data for ${t}`);
      let fetched = 0;
      let offset = 0;
      let firstRowCols = null;
      while (fetched < MAX_ROWS_PER_TABLE) {
        const { data: rows, error } = await supabaseAdmin
          .from(t)
          .select('*')
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) break;
        if (!rows || rows.length === 0) break;
        if (!firstRowCols) firstRowCols = Object.keys(rows[0]);
        for (const row of rows) {
          const cols = firstRowCols;
          const values = cols.map(c => qLit(row[c] ?? null)).join(', ');
          parts.push(`INSERT INTO ${qIdent(t)} (${cols.map(qIdent).join(', ')}) VALUES (${values});`);
        }
        fetched += rows.length;
        offset += rows.length;
        if (rows.length < PAGE_SIZE) break;
      }
      if (fetched >= MAX_ROWS_PER_TABLE) {
        parts.push(`-- NOTE: Row export for ${t} truncated at ${MAX_ROWS_PER_TABLE} rows.`);
      }
    }

    // Include all functions (best-effort)
    if (supabaseAdmin) {
      try {
        const { data: fns } = await supabaseAdmin.rpc('get_all_functions');
        if (Array.isArray(fns) && fns.length) {
          parts.push('\n-- Functions');
          parts.push(...fns.map(r => r.create_statement).filter(Boolean));
        }
      } catch (_) {}
    }

    parts.push('COMMIT;');
    const sqlContent = parts.join('\n');

    // Upload to Supabase Storage using service role
    let publicUrl = null;
    let signedUrl = null;
    let storagePath = null;
    let filename = null;

    if (supabaseAdmin) {
      await ensureBucketExists(supabaseAdmin, BACKUP_BUCKET);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeName = customName ? String(customName).replace(/[^a-zA-Z0-9-_]/g, '_') : '';
      filename = `backup_${backupType}_${timestamp}${safeName ? '_' + safeName : ''}.sql`;
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
    const timestamp2 = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName2 = customName ? String(customName).replace(/[^a-zA-Z0-9-_]/g, '_') : '';
    const filename2 = filename || `backup_${backupType}_${timestamp2}${safeName2 ? '_' + safeName2 : ''}.sql`;
    const token = Buffer.from(sqlContent, 'utf8').toString('base64');
    const filePath = `/.netlify/functions/api/backup?filename=${encodeURIComponent(filename2)}&token=${encodeURIComponent(token)}`;

    return res.json({
      success: true,
      message: 'Backup generated',
      filename: filename2,
      filePath,
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

// List existing backup objects from Supabase Storage
app.get('/api/admin/database-backup/list', async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: 'Storage admin not configured' })
    }
    const { data, error } = await supabaseAdmin.storage.from(BACKUP_BUCKET).list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })
    if (error) {
      return res.status(400).json({ success: false, message: error.message || 'Failed to list backups' })
    }
    const backups = data?.map(file => ({
      id: file.id,
      name: file.name,
      size: file.metadata?.size || 0,
      created_at: file.created_at,
      updated_at: file.updated_at,
      path: file.name
    })) || []
    return res.json({ success: true, backups })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to list backups' })
  }
})

// Delete a backup object from Supabase Storage
app.post('/api/admin/database-backup/delete', async (req, res) => {
  try {
    const { path, bucket } = req.body || {};
    if (!path) {
      return res.status(400).json({ success: false, message: 'Missing path' });
    }
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: 'Storage admin not configured' });
    }
    const targetBucket = bucket || BACKUP_BUCKET;
    const { data, error } = await supabaseAdmin.storage.from(targetBucket).remove([path]);
    if (error) {
      return res.status(400).json({ success: false, message: error.message || 'Failed to delete object' });
    }
    return res.json({ success: true, path, bucket: targetBucket, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to delete backup' });
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
