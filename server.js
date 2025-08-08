@@ .. @@
 const express = require('express');
 const cors = require('cors');
 const axios = require('axios');
+const crypto = require('crypto');
 require('dotenv').config();
 
 const app = express();
@@ .. @@
 // Apply authentication to all API routes
 app.use('/api/', authenticateClient);
 
+// Runtime Configuration Management
+const configCache = new Map();
+const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
+
+// Helper function to get client IP
+const getClientIP = (req) => {
+  return req.headers['x-forwarded-for'] || 
+         req.connection.remoteAddress || 
+         req.socket.remoteAddress ||
+         (req.connection.socket ? req.connection.socket.remoteAddress : null);
+};
+
+// Helper function to encrypt sensitive values
+const encryptValue = (value) => {
+  const algorithm = 'aes-256-gcm';
+  const key = crypto.scryptSync(process.env.API_ENCRYPTION_KEY || 'default-key', 'salt', 32);
+  const iv = crypto.randomBytes(16);
+  const cipher = crypto.createCipher(algorithm, key);
+  
+  let encrypted = cipher.update(value, 'utf8', 'hex');
+  encrypted += cipher.final('hex');
+  
+  return {
+    encrypted,
+    iv: iv.toString('hex'),
+    tag: cipher.getAuthTag().toString('hex')
+  };
+};
+
+// Helper function to decrypt sensitive values
+const decryptValue = (encryptedData) => {
+  try {
+    const algorithm = 'aes-256-gcm';
+    const key = crypto.scryptSync(process.env.API_ENCRYPTION_KEY || 'default-key', 'salt', 32);
+    const decipher = crypto.createDecipher(algorithm, key);
+    
+    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
+    decrypted += decipher.final('utf8');
+    
+    return decrypted;
+  } catch (error) {
+    console.error('Decryption failed:', error);
+    return null;
+  }
+};
+
+// Public endpoint for client runtime config
+app.get('/api/client-runtime-config', async (req, res) => {
+  try {
+    const environment = req.headers['x-env'] || req.query.env || 'production';
+    const appVersion = req.headers['x-app-version'];
+    const cacheKey = `public-config-${environment}`;
+    
+    // Check cache first
+    const cached = configCache.get(cacheKey);
+    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
+      return res.json({
+        data: cached.data,
+        cached: true,
+        timestamp: cached.timestamp
+      });
+    }
+
+    const supabaseUrl = process.env.SUPABASE_URL;
+    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
+
+    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_public_runtime_config`, {
+      env_name: environment
+    }, {
+      headers: {
+        'apikey': supabaseServiceKey,
+        'Authorization': `Bearer ${supabaseServiceKey}`,
+        'Content-Type': 'application/json'
+      }
+    });
+
+    // Transform array to object grouped by category
+    const configData = {};
+    const categories = {};
+    
+    response.data.forEach(item => {
+      configData[item.key] = item.value;
+      if (!categories[item.category]) {
+        categories[item.category] = {};
+      }
+      categories[item.category][item.key] = item.value;
+    });
+
+    const result = {
+      config: configData,
+      categories: categories,
+      environment: environment,
+      timestamp: new Date().toISOString()
+    };
+
+    // Cache the result
+    configCache.set(cacheKey, {
+      data: result,
+      timestamp: Date.now()
+    });
+
+    res.json({
+      data: result,
+      cached: false
+    });
+  } catch (error) {
+    console.error('Error fetching client runtime config:', error);
+    res.status(500).json({ error: 'Failed to fetch runtime configuration' });
+  }
+});
+
+// Admin endpoint to get all runtime config
+app.get('/api/admin/runtime-config', async (req, res) => {
+  try {
+    const environment = req.query.env || 'production';
+    const supabaseUrl = process.env.SUPABASE_URL;
+    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
+
+    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_all_runtime_config`, {
+      env_name: environment
+    }, {
+      headers: {
+        'apikey': supabaseServiceKey,
+        'Authorization': `Bearer ${supabaseServiceKey}`,
+        'Content-Type': 'application/json'
+      }
+    });
+
+    res.json(response.data);
+  } catch (error) {
+    console.error('Error fetching admin runtime config:', error);
+    res.status(500).json({ error: 'Failed to fetch runtime configuration' });
+  }
+});
+
+// Admin endpoint to upsert runtime config
+app.post('/api/admin/runtime-config', async (req, res) => {
+  try {
+    const { 
+      key, 
+      value, 
+      isPublic, 
+      environment = 'production', 
+      description, 
+      category = 'general',
+      reason 
+    } = req.body;
+    
+    const adminEmail = req.headers['x-admin-email'] || 'unknown';
+    const clientIP = getClientIP(req);
+    const userAgent = req.headers['user-agent'];
+
+    const supabaseUrl = process.env.SUPABASE_URL;
+    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
+
+    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/upsert_runtime_config`, {
+      config_key: key,
+      config_value: value,
+      is_public_param: isPublic,
+      env_name: environment,
+      description_param: description,
+      category_param: category,
+      admin_email_param: adminEmail,
+      ip_address_param: clientIP,
+      user_agent_param: userAgent,
+      reason_param: reason
+    }, {
+      headers: {
+        'apikey': supabaseServiceKey,
+        'Authorization': `Bearer ${supabaseServiceKey}`,
+        'Content-Type': 'application/json'
+      }
+    });
+
+    // Clear cache for this environment
+    configCache.delete(`public-config-${environment}`);
+
+    res.json(response.data);
+  } catch (error) {
+    console.error('Error saving runtime config:', error);
+    res.status(500).json({ error: 'Failed to save runtime configuration' });
+  }
+});
+
+// Admin endpoint to delete runtime config
+app.delete('/api/admin/runtime-config/:key', async (req, res) => {
+  try {
+    const { key } = req.params;
+    const environment = req.query.env || 'production';
+    const reason = req.body.reason || 'Deleted via admin panel';
+    
+    const adminEmail = req.headers['x-admin-email'] || 'unknown';
+    const clientIP = getClientIP(req);
+    const userAgent = req.headers['user-agent'];
+
+    const supabaseUrl = process.env.SUPABASE_URL;
+    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
+
+    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/delete_runtime_config`, {
+      config_key: key,
+      env_name: environment,
+      admin_email_param: adminEmail,
+      ip_address_param: clientIP,
+      user_agent_param: userAgent,
+      reason_param: reason
+    }, {
+      headers: {
+        'apikey': supabaseServiceKey,
+        'Authorization': `Bearer ${supabaseServiceKey}`,
+        'Content-Type': 'application/json'
+      }
+    });
+
+    // Clear cache for this environment
+    configCache.delete(`public-config-${environment}`);
+
+    res.json(response.data);
+  } catch (error) {
+    console.error('Error deleting runtime config:', error);
+    res.status(500).json({ error: 'Failed to delete runtime configuration' });
+  }
+});
+
+// Admin endpoint to get config audit logs
+app.get('/api/admin/config-audit-logs', async (req, res) => {
+  try {
+    const { key, env, days = 30, limit = 100 } = req.query;
+    const supabaseUrl = process.env.SUPABASE_URL;
+    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
+
+    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_config_audit_logs`, {
+      config_key_filter: key || null,
+      env_filter: env || null,
+      days_back: parseInt(days),
+      limit_count: parseInt(limit)
+    }, {
+      headers: {
+        'apikey': supabaseServiceKey,
+        'Authorization': `Bearer ${supabaseServiceKey}`,
+        'Content-Type': 'application/json'
+      }
+    });
+
+    res.json(response.data);
+  } catch (error) {
+    console.error('Error fetching config audit logs:', error);
+    res.status(500).json({ error: 'Failed to fetch audit logs' });
+  }
+});
+
+// Endpoint to clear config cache (admin only)
+app.post('/api/admin/clear-config-cache', (req, res) => {
+  try {
+    configCache.clear();
+    res.json({ success: true, message: 'Configuration cache cleared' });
+  } catch (error) {
+    console.error('Error clearing config cache:', error);
+    res.status(500).json({ error: 'Failed to clear cache' });
+  }
+});
+
 // Health check endpoint
 app.get('/health', (req, res) => {
-  res.json({ status: 'OK', timestamp: new Date().toISOString() });
+  res.json({ 
+    status: 'OK', 
+    timestamp: new Date().toISOString(),
+    cacheSize: configCache.size,
+    uptime: process.uptime()
+  });
 });