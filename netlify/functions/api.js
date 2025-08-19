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

// ----- HONEYPOT AND OBFUSCATION ENDPOINTS -----
// These endpoints are designed to confuse and trap unauthorized access attempts

// Fake endpoint that looks like the real one
app.get('/api/client-runtime-config-fake', (req, res) => {
  const fakeData = {
    error: 'Endpoint deprecated',
    message: 'This endpoint has been moved',
    redirect: '/api/v2/config',
    timestamp: new Date().toISOString()
  };
  res.status(410).json(fakeData);
});

// Another fake endpoint with misleading data
app.get('/api/v2/config', (req, res) => {
  const misleadingData = {
    data: {
      supabase: {
        url: 'https://fake-supabase.example.com',
        anonKey: 'fake_key_do_not_use'
      },
      features: {
        coinsEnabled: false,
        adsEnabled: false,
        vipEnabled: false
      }
    },
    message: 'This is a test endpoint',
    timestamp: new Date().toISOString()
  };
  res.json(misleadingData);
});

// Honeypot endpoint that logs unauthorized access
app.get('/api/config', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  
  console.warn('🚨 HONEYPOT TRIGGERED - Unauthorized access attempt:', {
    ip: clientIP,
    userAgent: userAgent.substring(0, 100),
    endpoint: '/api/config',
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found on this server'
  });
});

// Complex routing with multiple validation layers
app.get('/api/client-runtime-config', async (req, res) => {
  try {
    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    // Complex validation and obfuscation
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';
    
    // Complex request validation with multiple layers
    const validationLayers = [
      // Layer 1: Basic request structure
      () => {
        if (!req.headers['accept'] || !req.headers['user-agent']) {
          throw new Error('Invalid request headers');
        }
        return true;
      },
      
      // Layer 2: Origin validation with complex logic
      () => {
        const allowedOrigins = [
          'https://admin-vidgro.netlify.app',
          'exp://localhost',
          'exp://192.168',
          'exp://10.0',
          'exp://172.16',
          'http://localhost',
          'http://192.168',
          'http://10.0',
          'http://172.16'
        ];
        
        const isMobileApp = userAgent.includes('Expo') || 
                            userAgent.includes('ReactNative') || 
                            userAgent.includes('VidGro') ||
                            userAgent.includes('Mobile') ||
                            userAgent.includes('Android') ||
                            userAgent.includes('iOS');
        
        const isAllowedOrigin = allowedOrigins.some(allowed => 
          origin.includes(allowed) || 
          referer.includes(allowed)
        );
        
        // Complex validation logic
        const shouldAllow = isMobileApp || isAllowedOrigin || (!origin && !referer);
        
        if (!shouldAllow) {
          console.warn('🚨 Unauthorized access attempt to runtime config:', {
            requestId,
            ip: clientIP,
            userAgent: userAgent.substring(0, 100),
            referer: referer.substring(0, 100),
            origin: origin.substring(0, 100),
            isMobileApp,
            isAllowedOrigin,
            timestamp: new Date().toISOString()
          });
          throw new Error('Access denied');
        }
        
        return true;
      },
      
      // Layer 3: Rate limiting with complex algorithm
      () => {
        if (!global.complexRateLimitStore) {
          global.complexRateLimitStore = new Map();
        }
        
        const rateLimitKey = `complex_limit:${clientIP}`;
        const now = Date.now();
        const windowSize = 10 * 60 * 1000; // 10 minutes
        const maxRequests = 3; // Very restrictive
        
        const clientData = global.complexRateLimitStore.get(rateLimitKey) || { requests: [], lastReset: now };
        
        // Reset counter if window expired
        if (now - clientData.lastReset > windowSize) {
          clientData.requests = [];
          clientData.lastReset = now;
        }
        
        // Add current request
        clientData.requests.push(now);
        
        // Remove old requests outside window
        clientData.requests = clientData.requests.filter(time => now - time < windowSize);
        
        if (clientData.requests.length > maxRequests) {
          console.warn('🚨 Complex rate limit exceeded:', { requestId, clientIP, attempts: clientData.requests.length });
          throw new Error('Rate limit exceeded');
        }
        
        global.complexRateLimitStore.set(rateLimitKey, clientData);
        return true;
      },
      
      // Layer 4: Request timing validation
      () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 50) { // Too fast = suspicious
          throw new Error('Request timing validation failed');
        }
        return true;
      }
    ];
    
    // Execute validation layers with random delays
    for (let i = 0; i < validationLayers.length; i++) {
      const layer = validationLayers[i];
      
      // Add random delay between layers
      if (i > 0) {
        const delay = Math.random() * 50 + 10; // 10-60ms
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      try {
        await layer();
      } catch (error) {
        console.error(`🚨 Validation layer ${i + 1} failed:`, error.message);
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Request validation failed',
          requestId,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('✅ Complex validation passed for runtime config:', { requestId, clientIP, elapsed: Date.now() - startTime });

    // Return MINIMAL configuration for public endpoint - NO SENSITIVE DATA
    const config = {
      data: {
        supabase: {
          url: process.env.SUPABASE_URL || process.env.MOBILE_SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co',
          // NO anonKey here - mobile app must use secure endpoint
        },
        admob: {
          // Only return app ID, not the sensitive banner/interstitial IDs
          appId: process.env.ADMOB_APP_ID || 'ca-app-pub-2892152842024866~2841739969'
        },
        features: {
          coinsEnabled: true,
          adsEnabled: true,
          vipEnabled: true,
          referralsEnabled: true,
          analyticsEnabled: true
        },
        app: {
          minVersion: "1.0.0",
          forceUpdate: false,
          maintenanceMode: false,
          apiVersion: "v1"
        },
        security: {
          allowEmulators: false,
          allowRooted: false,
          requireSignatureValidation: true,
          adBlockDetection: true
        },
        metadata: {
          configVersion: "1.0.0",
          lastUpdated: new Date().toISOString(),
          ttl: 3600
        }
      },
      cached: false,
      environment: "production",
      message: "Use /api/client-runtime-config/secure for full configuration",
      requestId,
      timestamp: new Date().toISOString()
    };

    // Add random delay before response
    const responseDelay = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, responseDelay));

    res.json(config);
  } catch (error) {
    console.error('Error in complex client-runtime-config:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Secure authenticated endpoint for full runtime configuration
app.post('/api/client-runtime-config/secure', async (req, res) => {
  try {
    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    // Basic rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const rateLimitKey = `secure_config:${clientIP}`;
    
    // Simple in-memory rate limiting (5 attempts per 15 minutes)
    const now = Date.now();
    const rateLimitWindow = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const clientAttempts = global.rateLimitStore.get(rateLimitKey) || [];
    const validAttempts = clientAttempts.filter(timestamp => now - timestamp < rateLimitWindow);
    
    if (validAttempts.length >= maxAttempts) {
      console.warn('🚨 Rate limit exceeded for secure config:', { clientIP, attempts: validAttempts.length });
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil(rateLimitWindow / 1000)
      });
    }
    
    // Add current attempt
    validAttempts.push(now);
    global.rateLimitStore.set(rateLimitKey, validAttempts);

    // Verify client authentication
    const { clientId, clientSecret, deviceId } = req.body;
    
    if (!clientId || !clientSecret || !deviceId) {
      console.warn('🚨 Missing credentials for secure config:', { clientIP, hasClientId: !!clientId, hasSecret: !!clientSecret, hasDeviceId: !!deviceId });
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Missing credentials'
      });
    }

    // Verify client credentials
    const validClientId = process.env.MOBILE_CLIENT_ID || 'vidgro_mobile_2024';
    const validClientSecret = process.env.MOBILE_CLIENT_SECRET || 'vidgro_secret_key_2024';
    
    if (clientId !== validClientId || clientSecret !== validClientSecret) {
      console.warn('🚨 Invalid client credentials attempt:', { clientIP, clientId, deviceId });
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Secure config access granted for:', { clientIP, deviceId });

    // Return full configuration for authenticated clients
    const config = {
      data: {
        supabase: {
          url: process.env.SUPABASE_URL || process.env.MOBILE_SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co',
          anonKey: process.env.SUPABASE_ANON_KEY || process.env.MOBILE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.LRmGLu1OAcJza-eEPSIJUaFAyhxkdAGrbyRFRGSWpVw'
        },
        admob: {
          appId: process.env.ADMOB_APP_ID || 'ca-app-pub-2892152842024866~2841739969',
          bannerId: process.env.ADMOB_BANNER_ID || 'ca-app-pub-2892152842024866/6180566789',
          interstitialId: process.env.ADMOB_INTERSTITIAL_ID || 'ca-app-pub-2892152842024866/2604283857',
          rewardedId: process.env.ADMOB_REWARDED_ID || 'ca-app-pub-2892152842024866/2049185437'
        },
        features: {
          coinsEnabled: true,
          adsEnabled: true,
          vipEnabled: true,
          referralsEnabled: true,
          analyticsEnabled: true
        },
        app: {
          minVersion: "1.0.0",
          forceUpdate: false,
          maintenanceMode: false,
          apiVersion: "v1"
        },
        security: {
          allowEmulators: false,
          allowRooted: false,
          requireSignatureValidation: true,
          adBlockDetection: true
        },
        metadata: {
          configVersion: "1.0.0",
          lastUpdated: new Date().toISOString(),
          ttl: 3600
        }
      },
      cached: false,
      environment: "production",
      authenticated: true,
      deviceId
    };

    res.json(config);
  } catch (error) {
    console.error('Error in secure client-runtime-config:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.log('Delete backup request:', { path, bucket });
    
    if (!path) {
      console.log('Missing path in delete request');
      return res.status(400).json({ success: false, message: 'Missing path' });
    }
    
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.log('Supabase admin not configured');
      return res.status(500).json({ success: false, message: 'Storage admin not configured' });
    }
    
    const targetBucket = bucket || BACKUP_BUCKET;
    console.log('Attempting to delete from bucket:', targetBucket, 'path:', path);
    
    const { data, error } = await supabaseAdmin.storage.from(targetBucket).remove([path]);
    
    if (error) {
      console.log('Delete error:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to delete object' });
    }
    
    console.log('Delete successful:', { path, bucket: targetBucket, data });
    return res.json({ success: true, path, bucket: targetBucket, data });
  } catch (e) {
    console.log('Delete exception:', e);
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
