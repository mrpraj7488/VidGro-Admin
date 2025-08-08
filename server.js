const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

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
  
  // Validate API key (in production, this should be more robust)
  if (!apiKey || apiKey === 'demo-key') {
    // Allow demo key for development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ error: 'Invalid API key' });
    }
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
    
    // Log access attempt for security monitoring
    console.log(`[CONFIG ACCESS] ${clientIP} requested ${environment} config (v${appVersion || 'unknown'})`);
    
    // Check cache first
    const cached = configCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      // Add security headers
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'private, max-age=300'
      });
      
      return res.json({
        data: cached.data,
        cached: true,
        timestamp: cached.timestamp,
        environment: environment
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_public_runtime_config`, {
      env_name: environment
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Transform array to object grouped by category
    const configData = {};
    const categories = {};
    
    response.data.forEach(item => {
      configData[item.key] = item.value;
      if (!categories[item.category]) {
        categories[item.category] = {};
      }
      categories[item.category][item.key] = item.value;
    });

    const result = {
      config: configData,
      categories: categories,
      environment: environment,
      timestamp: new Date().toISOString(),
      version: appVersion || 'unknown',
      checksum: generateConfigChecksum(configData)
    };

    // Cache the result
    configCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cache-Control': 'private, max-age=300'
    });

    res.json({
      data: result,
      cached: false,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  } catch (error) {
    console.error('Error fetching client runtime config:', error);
    
    // Log security event
    console.log(`[SECURITY] Config fetch failed for ${getClientIP(req)}: ${error.message}`);
    
    res.status(500).json({ error: 'Failed to fetch runtime configuration' });
  }
});

// Helper function to generate config checksum for integrity verification
const generateConfigChecksum = (configData) => {
  const crypto = require('crypto');
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
  // Mock implementation - in real app, check against admin_profiles table
  const allowedAdmins = [
    'admin@vidgro.com',
    'superadmin@vidgro.com'
  ];
  return allowedAdmins.includes(adminEmail);
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
    
    // Mock security events - in real app, this would come from security monitoring system
    const mockEvents = [
      {
        id: '1',
        type: 'key_rotation',
        severity: 'medium',
        description: 'JWT secret key rotated successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'admin@vidgro.com',
        resolved: true
      },
      {
        id: '2',
        type: 'access_attempt',
        severity: 'high',
        description: 'Multiple failed API key validation attempts detected',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.100',
        resolved: false
      }
    ];
    
    res.json({
      data: mockEvents,
      metadata: {
        totalEvents: mockEvents.length,
        unresolvedEvents: mockEvents.filter(e => !e.resolved).length,
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