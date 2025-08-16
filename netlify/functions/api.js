import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

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

// Enhanced public endpoint for client runtime config
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
    const resolvedSupabaseUrl = runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_URL;
    const resolvedSupabaseAnonKey = runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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
        url: runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_URL,
        anonKey: runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
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

// Netlify serverless function handler
export const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-app-version, x-env, x-admin-email',
      },
      body: ''
    };
  }

  // Create a mock request object for Express
  const req = {
    method: event.httpMethod,
    path: event.path.replace('/.netlify/functions/api', ''),
    headers: event.headers,
    query: event.queryStringParameters || {},
    body: event.body ? JSON.parse(event.body) : {},
    connection: { remoteAddress: event.headers['client-ip'] || 'unknown' },
    socket: { remoteAddress: event.headers['client-ip'] || 'unknown' }
  };

  // Create a mock response object
  let responseBody = '';
  let responseStatus = 200;
  let responseHeaders = {};

  const res = {
    status: (code) => {
      responseStatus = code;
      return res;
    },
    json: (data) => {
      responseBody = JSON.stringify(data);
      responseHeaders['Content-Type'] = 'application/json';
    },
    send: (data) => {
      responseBody = typeof data === 'string' ? data : JSON.stringify(data);
    },
    set: (headers) => {
      Object.assign(responseHeaders, headers);
    }
  };

  try {
    // Route the request through Express
    await new Promise((resolve, reject) => {
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.send = function(data) {
        originalSend.call(this, data);
        resolve();
      };
      
      res.json = function(data) {
        originalJson.call(this, data);
        resolve();
      };

      // Handle the request
      app._router.handle(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return {
      statusCode: responseStatus,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-app-version, x-env, x-admin-email',
        ...responseHeaders
      },
      body: responseBody
    };
  } catch (error) {
    console.error('Serverless function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-app-version, x-env, x-admin-email',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
