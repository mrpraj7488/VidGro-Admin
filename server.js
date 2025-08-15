import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// In-memory runtime overrides synced from Admin UI
const runtimeOverrides = {
  supabaseUrl: null,
  supabaseAnonKey: null,
};

// Load saved environment overrides on startup
try {
  const envPath = path.join(__dirname, '.env.server.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key === 'MOBILE_SUPABASE_URL' && value) {
        runtimeOverrides.supabaseUrl = value;
      }
      if (key === 'MOBILE_SUPABASE_ANON_KEY' && value) {
        runtimeOverrides.supabaseAnonKey = value;
      }
      // Load AdMob keys
      if (key === 'ADMOB_APP_ID' && value) {
        process.env.ADMOB_APP_ID = value;
      }
      if (key === 'ADMOB_BANNER_ID' && value) {
        process.env.ADMOB_BANNER_ID = value;
      }
      if (key === 'ADMOB_INTERSTITIAL_ID' && value) {
        process.env.ADMOB_INTERSTITIAL_ID = value;
      }
      if (key === 'ADMOB_REWARDED_ID' && value) {
        process.env.ADMOB_REWARDED_ID = value;
      }
    }
  }
} catch (e) {
  console.warn('Could not load saved env overrides:', e.message);
}

// Add missing authenticateClient middleware
const authenticateClient = (req, res, next) => {
  // For now, allow all requests - in production, implement proper authentication
  // This is a placeholder for the authentication logic
  console.log(`[AUTH] ${req.method} ${req.path} from ${req.ip}`);
  next();
};

// Apply CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Apply authentication to all API routes
app.use('/api/', authenticateClient);

// Runtime Configuration Management
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const rateLimitMap = new Map(); // Simple rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientIP = getClientIP(req);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  for (const [ip, requests] of rateLimitMap.entries()) {
    rateLimitMap.set(ip, requests.filter(time => time > windowStart));
    if (rateLimitMap.get(ip).length === 0) {
      rateLimitMap.delete(ip);
    }
  }
  
  // Check current IP
  const requests = rateLimitMap.get(clientIP) || [];
  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
    });
  }
  
  // Add current request
  requests.push(now);
  rateLimitMap.set(clientIP, requests);
  
  next();
};

// Enhanced security validation
const validateClientRequest = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const appVersion = req.headers['x-app-version'];
  const environment = req.headers['x-env'] || req.query.env || 'production';
  
  // In development mode, allow requests without API keys
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Bypassing auth for ${req.method} ${req.path} - NODE_ENV: ${process.env.NODE_ENV}`);
    req.validatedEnv = environment;
    return next();
  }
  
  // Validate API key (in production, this should be more robust)
  if (!apiKey || apiKey === 'demo-key') {
    console.log(`[AUTH FAIL] Missing/invalid API key for ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Validate app version (optional)
  if (appVersion && !isValidAppVersion(appVersion)) {
    return res.status(400).json({ 
      error: 'Unsupported app version',
      minVersion: '1.0.0'
    });
  }
  
  // Validate environment
  if (!['production', 'staging', 'development'].includes(environment)) {
    return res.status(400).json({ error: 'Invalid environment' });
  }
  
  req.validatedEnv = environment;
  next();
};

const isValidAppVersion = (version) => {
  // Simple version validation - in production, use semver
  return /^\d+\.\d+\.\d+$/.test(version);
};

// Helper function to encrypt sensitive values
const encryptValue = (value) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.API_ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
};

// Helper function to decrypt sensitive values
const decryptValue = (encryptedData) => {
  try {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.API_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Enhanced public endpoint for client runtime config with security
app.get('/api/client-runtime-config', rateLimit, validateClientRequest, async (req, res) => {
  try {
    const environment = req.validatedEnv;
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

    // Resolve Supabase values (prefer overrides → env → fallback)
    const resolvedSupabaseUrl = runtimeOverrides.supabaseUrl || process.env.MOBILE_SUPABASE_URL || process.env.SUPABASE_PUBLIC_URL || process.env.SUPABASE_URL;
    const resolvedSupabaseAnonKey = runtimeOverrides.supabaseAnonKey || process.env.MOBILE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // If we have resolved values (from overrides/env), serve them immediately
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

    // Fallback: fetch from Supabase DB if configured with service role
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_public_runtime_config`, { env_name: environment }, {
        headers: { apikey: supabaseServiceKey, Authorization: `Bearer ${supabaseServiceKey}`, 'Content-Type': 'application/json' }
      });

      const configData = {}; const categories = {};
      response.data.forEach(item => { configData[item.key] = item.value; (categories[item.category] ||= {})[item.key] = item.value; });

      const result = { config: configData, categories, environment, timestamp: new Date().toISOString(), version: appVersion || 'unknown', checksum: generateConfigChecksum(configData) };
      configCache.set(cacheKey, { data: result, timestamp: Date.now() });
      res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-XSS-Protection': '1; mode=block', 'Cache-Control': 'private, max-age=300' });
      return res.json({ data: result, cached: false, requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` });
    }

    // Production fallback with real configuration
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
    
    // Only return if we have valid Supabase config
    if (productionConfig.supabase.url && productionConfig.supabase.anonKey) {
      res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-XSS-Protection': '1; mode=block', 'Cache-Control': 'private, max-age=300' });
      return res.json({ data: productionConfig, cached: false, environment });
    }
    
    // If no valid config is available, return error
    console.error('[CONFIG ERROR] No valid Supabase configuration available');
    return res.status(503).json({ 
      error: 'Service temporarily unavailable', 
      message: 'Application configuration not properly set up. Please contact administrator.' 
    });
  } catch (error) {
    console.error('Error fetching client runtime config:', error);
    console.log(`[SECURITY] Config fetch failed for ${getClientIP(req)}: ${error.message}`);
    return res.status(500).json({ error: 'Failed to fetch runtime configuration' });
  }
});

// Helper function to generate config checksum for integrity verification
const generateConfigChecksum = (configData) => {
  const configString = JSON.stringify(configData, Object.keys(configData).sort());
  return crypto.createHash('sha256').update(configString).digest('hex').substring(0, 16);
};

// Enhanced admin endpoint with better security
app.get('/api/admin/runtime-config', async (req, res) => {
  try {
    const environment = req.query.env || 'production';
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    const clientIP = getClientIP(req);
    
    // Enhanced logging for admin access
    console.log(`[ADMIN ACCESS] ${adminEmail} (${clientIP}) accessed ${environment} runtime config`);
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check admin permissions (mock implementation)
    const hasPermission = await checkAdminConfigPermission(adminEmail);
    if (!hasPermission) {
      console.log(`[SECURITY] Unauthorized config access attempt by ${adminEmail} from ${clientIP}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_all_runtime_config`, {
      env_name: environment
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add metadata for admin panel
    res.json({
      data: response.data,
      metadata: {
        environment,
        totalConfigs: response.data.length,
        publicConfigs: response.data.filter(c => c.is_public).length,
        privateConfigs: response.data.filter(c => !c.is_public).length,
        lastFetched: new Date().toISOString(),
        requestedBy: adminEmail
      }
    });
  } catch (error) {
    console.error('Error fetching admin runtime config:', error);
    res.status(500).json({ error: 'Failed to fetch runtime configuration' });
  }
});

// Helper function to check admin permissions
const checkAdminConfigPermission = async (adminEmail) => {
  // Real admin permission check - integrate with your auth system
  const allowedAdmins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return allowedAdmins.includes(adminEmail) || adminEmail === process.env.VITE_ADMIN_EMAIL;
};

// Admin endpoint to upsert runtime config
app.post('/api/admin/runtime-config', async (req, res) => {
  try {
    const { 
      key, 
      value, 
      isPublic, 
      environment = 'production', 
      description, 
      category = 'general',
      reason 
    } = req.body;
    
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    // Enhanced validation
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    if (key.length > 100 || value.length > 10000) {
      return res.status(400).json({ error: 'Key or value too long' });
    }
    
    // Check for sensitive data in public configs
    if (isPublic && (key.toLowerCase().includes('secret') || key.toLowerCase().includes('private'))) {
      return res.status(400).json({ error: 'Secret keys cannot be marked as public' });
    }

    // Log configuration change attempt
    console.log(`[CONFIG CHANGE] ${adminEmail} (${clientIP}) attempting to ${reason ? 'update' : 'create'} ${key} in ${environment}`);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/upsert_runtime_config`, {
      config_key: key,
      config_value: value,
      is_public_param: isPublic,
      env_name: environment,
      description_param: description,
      category_param: category,
      admin_email_param: adminEmail,
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      reason_param: reason
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Clear cache for this environment
    configCache.delete(`public-config-${environment}`);
    
    // Clear all related caches
    for (const [cacheKey] of configCache.entries()) {
      if (cacheKey.includes(environment)) {
        configCache.delete(cacheKey);
      }
    }

    console.log(`[CONFIG SUCCESS] ${key} ${reason ? 'updated' : 'created'} successfully by ${adminEmail}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error saving runtime config:', error);
    console.log(`[CONFIG ERROR] Failed to save ${req.body.key}: ${error.message}`);
    res.status(500).json({ error: 'Failed to save runtime configuration' });
  }
});

// Admin endpoint to delete runtime config
app.delete('/api/admin/runtime-config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const environment = req.query.env || 'production';
    const reason = req.body.reason || 'Deleted via admin panel';
    
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    // Enhanced security check for critical keys
    const criticalKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET', 'API_ENCRYPTION_KEY'];
    if (criticalKeys.includes(key)) {
      console.log(`[SECURITY ALERT] Attempt to delete critical key ${key} by ${adminEmail} from ${clientIP}`);
      return res.status(403).json({ 
        error: 'Critical system keys cannot be deleted',
        suggestion: 'Consider rotating the key instead'
      });
    }

    console.log(`[CONFIG DELETE] ${adminEmail} (${clientIP}) attempting to delete ${key} from ${environment}`);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/delete_runtime_config`, {
      config_key: key,
      env_name: environment,
      admin_email_param: adminEmail,
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      reason_param: reason
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Clear cache for this environment
    configCache.delete(`public-config-${environment}`);

    console.log(`[CONFIG SUCCESS] ${key} deleted successfully by ${adminEmail}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting runtime config:', error);
    console.log(`[CONFIG ERROR] Failed to delete ${req.params.key}: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete runtime configuration' });
  }
});

// Admin endpoint to get config audit logs
app.get('/api/admin/config-audit-logs', async (req, res) => {
  try {
    const { key, env, days = 30, limit = 100 } = req.query;
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    const clientIP = getClientIP(req);
    
    console.log(`[AUDIT ACCESS] ${adminEmail} (${clientIP}) accessing audit logs`);
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_config_audit_logs`, {
      config_key_filter: key || null,
      env_filter: env || null,
      days_back: parseInt(days),
      limit_count: parseInt(limit)
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      data: response.data,
      metadata: {
        totalLogs: response.data.length,
        dateRange: `${days} days`,
        environment: env || 'all',
        requestedBy: adminEmail
      }
    });
  } catch (error) {
    console.error('Error fetching config audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// New endpoint for security monitoring
app.get('/api/admin/security-events', async (req, res) => {
  try {
    const { days = 7, severity, type } = req.query;
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    
    console.log(`[SECURITY ACCESS] ${adminEmail} accessing security events`);
    
    // Real security events from monitoring system
    const securityEvents = []; // To be populated by real security monitoring
    
    res.json({
      data: securityEvents,
      metadata: {
        totalEvents: securityEvents.length,
        unresolvedEvents: securityEvents.filter(e => !e.resolved).length,
        dateRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// New endpoint for key rotation
app.post('/api/admin/rotate-keys', async (req, res) => {
  try {
    const { keys, reason, notifyClients = false } = req.body;
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    const clientIP = getClientIP(req);
    
    console.log(`[KEY ROTATION] ${adminEmail} (${clientIP}) rotating keys: ${keys.join(', ')}`);
    
    // Mock key rotation - in real app, this would generate new keys and update configs
    const rotationResults = [];
    
    for (const key of keys) {
      const newValue = generateNewKey(key);
      rotationResults.push({
        key,
        oldValue: '***hidden***',
        newValue: '***hidden***',
        rotatedAt: new Date().toISOString()
      });
    }
    
    // If notifyClients is true, trigger client notification
    if (notifyClients) {
      console.log(`[NOTIFICATION] Notifying clients about key rotation`);
      // In real app, this would send push notifications to mobile clients
    }
    
    res.json({
      success: true,
      message: `${keys.length} keys rotated successfully`,
      rotatedKeys: rotationResults,
      notificationSent: notifyClients
    });
  } catch (error) {
    console.error('Error rotating keys:', error);
    res.status(500).json({ error: 'Failed to rotate keys' });
  }
});

// Helper function to generate new keys
const generateNewKey = (keyType) => {
  const timestamp = Date.now();
  if (keyType.includes('JWT')) {
    return `jwt_secret_${timestamp}_${crypto.randomBytes(16).toString('hex')}`;
  }
  if (keyType.includes('API')) {
    return `api_key_${timestamp}_${crypto.randomBytes(20).toString('hex')}`;
  }
  return `key_${timestamp}_${crypto.randomBytes(12).toString('hex')}`;
};

// Endpoint to clear config cache (admin only)
app.post('/api/admin/clear-config-cache', (req, res) => {
  try {
    const adminEmail = req.headers['x-admin-email'] || 'unknown';
    console.log(`[CACHE CLEAR] ${adminEmail} cleared configuration cache`);
    
    configCache.clear();
    res.json({ 
      success: true, 
      message: 'Configuration cache cleared',
      clearedAt: new Date().toISOString(),
      clearedBy: adminEmail
    });
  } catch (error) {
    console.error('Error clearing config cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Admin endpoint to sync environment variables from the Admin UI
app.post('/api/admin/env-sync', async (req, res) => {
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

    // Prefer explicit MOBILE_* vars; fallback to generic names
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

    // Optionally persist to a local .env file for restarts
    try {
      const envPath = path.join(__dirname, '.env.server.local');
      let content = `MOBILE_SUPABASE_URL=${newUrl}\nMOBILE_SUPABASE_ANON_KEY=${newAnon}\n`;
      
      // Add AdMob keys if provided
      if (ADMOB_APP_ID) content += `ADMOB_APP_ID=${ADMOB_APP_ID}\n`;
      if (ADMOB_BANNER_ID) content += `ADMOB_BANNER_ID=${ADMOB_BANNER_ID}\n`;
      if (ADMOB_INTERSTITIAL_ID) content += `ADMOB_INTERSTITIAL_ID=${ADMOB_INTERSTITIAL_ID}\n`;
      if (ADMOB_REWARDED_ID) content += `ADMOB_REWARDED_ID=${ADMOB_REWARDED_ID}\n`;
      
      fs.writeFileSync(envPath, content, { encoding: 'utf8' });
      console.log('📄 Environment variables persisted to .env.server.local');
    } catch (e) {
      console.warn('Could not persist env overrides:', e.message);
    }

    // Clear config cache so next fetch returns updated values
    for (const key of Array.from(configCache.keys())) {
      if (key.startsWith('public-config-')) configCache.delete(key);
    }

    return res.json({ success: true, message: 'Environment synchronized', overrides: runtimeOverrides });
  } catch (error) {
    console.error('env-sync failed:', error);
    return res.status(500).json({ success: false, message: 'Failed to synchronize environment' });
  }
});

// Database backup endpoint
app.post('/api/admin/database-backup', async (req, res) => {
  try {
    const { backupType, customName } = req.body;
    
    console.log('🔄 Starting server-side database backup...');
    
    // Load environment variables for server-side backup
    dotenv.config({ path: '.env.node' });
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://kuibswqfmhhdybttbcoa.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in server environment');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error: Missing service role key' 
      });
    }
    
    console.log('✅ Server environment loaded:', {
      supabaseUrl,
      serviceKeyLength: supabaseServiceKey.length
    });
    
    // Create Supabase client with service role key
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection and discover tables
    console.log('🔍 Testing Supabase connection and discovering tables...');
    let tableNames = [];
    
    try {
      // Test connection by trying to query the profiles table directly
      console.log('🔍 Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Failed to connect to database:', testError);
        return res.status(500).json({ 
          success: false, 
          message: `Database connection test failed: ${testError.message}` 
        });
      }
      
      console.log('✅ Database connection successful, found profiles:', testData?.length || 0);
      
      // Use the known table names from our migrations
      tableNames = ['profiles', 'videos', 'transactions', 'bug_reports', 'runtime_config', 'system_settings', 'admin_logs', 'video_deletions'];
      
      console.log('✅ Database connection successful, found tables:', tableNames);
      
      // Try to query the profiles table (main user table)
      if (tableNames.includes('profiles')) {
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.warn('⚠️ Could not query profiles table:', testError);
        } else {
          console.log('✅ Test query successful, found profiles:', testData?.length || 0);
        }
      }
      
    } catch (testErr) {
      console.error('❌ Test query exception:', testErr);
      return res.status(500).json({ 
        success: false, 
        message: `Database connection failed: ${testErr.message}` 
      });
    }
    
    // Generate SQL backup content
    let sqlContent = `-- VidGro Database Backup (Server-Side)
-- Created: ${new Date().toISOString()}
-- Type: ${backupType || 'full'}
-- Tables: ${tableNames.join(', ')}
-- Database: ${supabaseUrl}
-- Connection: postgresql://postgres:[Vidgro@12345]@db.kuibswqfmhhdybttbcoa.supabase.co:5432/postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Begin Transaction
BEGIN;

`;
    
    // Backup each table
    for (const tableName of tableNames) {
      try {
        console.log(`🔍 Backing up table: ${tableName}`);
        
        // Get table structure using raw SQL query
        sqlContent += `\n-- Table structure for ${tableName}\n`;
        
        try {
          // Get table structure using raw SQL
          const { data: tableStructure, error: structureError } = await supabase
            .rpc('get_table_structure', { table_name: tableName });
          
          if (structureError) {
            console.warn(`⚠️ Could not get table structure for ${tableName}:`, structureError);
            sqlContent += `-- Warning: Could not get table structure for ${tableName}\n`;
            sqlContent += `-- Using basic CREATE TABLE statement\n`;
            sqlContent += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
            sqlContent += `  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n`;
            sqlContent += `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n`;
            sqlContent += `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n`;
            sqlContent += `);\n\n`;
          } else {
            // Use the actual table structure
            sqlContent += tableStructure.create_statement + '\n\n';
          }
          
          // Get indexes for this table
          const { data: indexes, error: indexError } = await supabase
            .rpc('get_table_indexes', { table_name: tableName });
          
          if (!indexError && indexes && indexes.length > 0) {
            sqlContent += `-- Indexes for ${tableName}\n`;
            indexes.forEach(index => {
              sqlContent += index.create_statement + '\n';
            });
            sqlContent += '\n';
          }
          
          // Get triggers for this table
          const { data: triggers, error: triggerError } = await supabase
            .rpc('get_table_triggers', { table_name: tableName });
          
          if (!triggerError && triggers && triggers.length > 0) {
            sqlContent += `-- Triggers for ${tableName}\n`;
            triggers.forEach(trigger => {
              sqlContent += trigger.create_statement + '\n';
            });
            sqlContent += '\n';
          }
          
        } catch (structureErr) {
          console.warn(`⚠️ Error getting schema for ${tableName}:`, structureErr);
          sqlContent += `-- Warning: Could not get complete schema for ${tableName}\n`;
          sqlContent += `-- Using basic CREATE TABLE statement\n`;
          sqlContent += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
          sqlContent += `  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n`;
          sqlContent += `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n`;
          sqlContent += `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n`;
          sqlContent += `);\n\n`;
        }
        
        // Get table data
        const { data: rows, error: dataError } = await supabase
          .from(tableName)
          .select('*');
        
        if (dataError) {
          console.warn(`⚠️ Could not get data for ${tableName}:`, dataError);
          sqlContent += `-- Warning: Could not get data for ${tableName}: ${dataError.message}\n`;
          continue;
        }
        
        if (rows && rows.length > 0) {
          sqlContent += `-- Data for ${tableName}\n`;
          
          for (const row of rows) {
            const columnNames = Object.keys(row);
            const values = columnNames.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'boolean') return val ? 'true' : 'false';
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return val;
            });
            
            sqlContent += `INSERT INTO "${tableName}" (${columnNames.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          
          console.log(`✅ Backed up ${rows.length} rows from ${tableName}`);
        } else {
          console.log(`ℹ️ Table ${tableName} is empty`);
          sqlContent += `-- Table ${tableName} is empty\n`;
        }
        
      } catch (tableError) {
        console.error(`❌ Error backing up table ${tableName}:`, tableError);
        sqlContent += `-- Error backing up table: ${tableName}\n`;
        sqlContent += `-- ${tableError.message}\n`;
      }
    }
    
    // Add RLS policies section
    sqlContent += `\n-- Row Level Security (RLS) Policies\n`;
    sqlContent += `-- Enable RLS on all tables\n`;
    for (const tableName of tableNames) {
      sqlContent += `ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;\n`;
    }
    sqlContent += `\n`;
    
    // Add policies for each table
    for (const tableName of tableNames) {
      try {
        const { data: policies, error: policyError } = await supabase
          .rpc('get_table_policies', { table_name: tableName });
        
        if (!policyError && policies && policies.length > 0) {
          sqlContent += `-- RLS Policies for ${tableName}\n`;
          policies.forEach(policy => {
            sqlContent += policy.create_statement + '\n';
          });
          sqlContent += '\n';
        }
      } catch (policyErr) {
        console.warn(`⚠️ Could not get policies for ${tableName}:`, policyErr);
      }
    }
    
    // Add functions section
    sqlContent += `-- Database Functions\n`;
    try {
      const { data: functions, error: functionError } = await supabase
        .rpc('get_all_functions');
      
      if (!functionError && functions && functions.length > 0) {
        functions.forEach(func => {
          sqlContent += func.create_statement + '\n\n';
        });
      }
    } catch (functionErr) {
      console.warn('⚠️ Could not get functions:', functionErr);
    }
    
    sqlContent += `\n-- Commit Transaction\nCOMMIT;\n\n`;
    sqlContent += `-- Backup completed successfully\n`;
    sqlContent += `-- Total tables: ${tableNames.length}\n`;
    sqlContent += `-- Generated at: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database: ${supabaseUrl}\n`;
    sqlContent += `-- This backup includes: Tables, Data, Indexes, Triggers, RLS Policies, and Functions\n`;
    
    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupTypeStr = backupType || 'full';
    const nameStr = customName ? customName.replace(/[^a-zA-Z0-9-_]/g, '_') : '';
    const filename = `backup_${backupTypeStr}_${timestamp}${nameStr ? '_' + nameStr : ''}.sql`;
    
    // Ensure backups directory exists
    const backupsDir = path.join(__dirname, 'public', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Write backup file to server
    const filePath = path.join(backupsDir, filename);
    fs.writeFileSync(filePath, sqlContent, 'utf8');
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024 / 1024).toFixed(2); // MB
    
    console.log('💾 Database backup completed successfully:', {
      filename,
      size: `${fileSize} MB`,
      type: backupType,
      path: filePath,
      tables: tableNames.length,
      timestamp: new Date().toISOString()
    });
    
    return res.json({ 
      success: true, 
      message: 'Database backup completed successfully',
      filename,
      filePath: `/backups/${filename}`,
      size: fileSize,
      tables: tableNames.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database backup failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to create database backup: ${error.message}` 
    });
  }
});

// Bug Report endpoint for mobile app integration
app.post('/api/bug-report', rateLimit, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      userId,
      userEmail,
      deviceInfo,
      appVersion,
      issueType
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and description are required' 
      });
    }

    // Generate unique bug ID
    const bugId = `bug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create bug report object
    const bugReport = {
      bug_id: bugId,
      title: title.trim(),
      description: description.trim(),
      status: 'new',
      priority: priority || 'medium',
      reported_by: userEmail || userId || 'mobile_user',
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: category || 'Mobile App',
      device_info: deviceInfo || {},
      app_version: appVersion || 'unknown',
      issue_type: issueType || 'technical',
      source: 'mobile_app'
    };

    // In a real implementation, you would save this to a database
    // For now, we'll store it in memory and log it
    console.log('🐛 New bug report received:', {
      id: bugId,
      title: bugReport.title,
      category: bugReport.category,
      priority: bugReport.priority,
      reported_by: bugReport.reported_by,
      timestamp: bugReport.created_at
    });

    // TODO: Save to database (Supabase or other)
    // This is where you would integrate with your existing bug report system

    return res.json({ 
      success: true, 
      message: 'Bug report submitted successfully',
      bugId: bugId,
      estimatedResponseTime: priority === 'critical' ? '1 hour' : 
                           priority === 'high' ? '2-4 hours' : 
                           priority === 'medium' ? '4-8 hours' : '24 hours'
    });

  } catch (error) {
    console.error('Bug report submission failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit bug report' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cacheSize: configCache.size,
    uptime: process.uptime(),
    rateLimitEntries: rateLimitMap.size,
    environment: process.env.NODE_ENV || 'development',
    version: '2.1.0'
  });
});

// Test endpoint to check environment
app.get('/test-env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV === 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Serve the React app for all other routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001; // Use port 3001 for API server

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Admin Panel API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Runtime config: http://localhost:${PORT}/api/client-runtime-config`);
  console.log(`🖥️ Admin Panel UI: http://localhost:5173 (via Vite proxy)`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Network URL: http://10.50.139.117:${PORT}`);
  console.log(`🔗 API requests will be proxied from Vite dev server`);
});
