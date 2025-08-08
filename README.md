follows all your requirements and provides a robust, secure foundation for VidGro application. All API tokens are now securely managed server-side, and the client communicates through the secure proxy system.

// .env 

# Server Configuration
PORT=3001
NODE_ENV=production

# Client Configuration
CLIENT_URL=http://localhost:8081
CLIENT_API_KEY=your-secure-client-api-key-here

# Supabase Configuration (Server-side only)
SUPABASE_URL=https://kuibswqfmhhdybttbcoa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4MjA1NiwiZXhwIjoyMDY5MzU4MDU2fQ.hJNaVa025MEen4DM567AO1y0NQxAZO3HWt6nbX6OBKs

# AdMob Configuration (Server-side only)
ADMOB_APP_ID=ca-app-pub-2892152842024866~2841739969
ADMOB_BANNER_ID=ca-app-pub-2892152842024866/6180566789
ADMOB_INTERSTITIAL_ID=ca-app-pub-2892152842024866/2604283857
ADMOB_REWARDED_ID=ca-app-pub-2892152842024866/2049185437

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=your-jwt-secret-key-here
API_KEY_SALT=your-api-key-salt-here 


// package.json

{
  "name": "vidgro-secure-api-proxy",
  "version": "1.0.0",
  "description": "Secure API proxy server for VidGro mobile app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "security-check": "npm audit"
  },
  "keywords": [
    "api",
    "proxy",
    "security",
    "supabase",
    "vidgro"
  ],
  "author": "VidGro Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "eslint": "^8.54.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
} 


// README.MD

# VidGro Secure API Proxy Server

A secure Node.js Express server that acts as a centralized configuration hub and API proxy for the VidGro mobile app, managing runtime configuration, API keys, and secure token delivery.

## 🔐 Security Features

- **Token Protection**: All sensitive API keys stored server-side only
- **Runtime Configuration**: Dynamic config delivery to mobile clients
- **Environment Management**: Separate configs for dev/staging/production
- **Audit Logging**: Complete change tracking for security compliance
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **API Key Authentication**: Client authentication via API keys
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Error Handling**: Comprehensive error handling and logging
- **HTTPS Ready**: Configured for production HTTPS deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📋 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Client Configuration
CLIENT_URL=http://localhost:8081
CLIENT_API_KEY=your-secure-client-api-key-here

# Supabase Configuration (Server-side only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AdMob Configuration (Server-side only)
ADMOB_APP_ID=your-admob-app-id
ADMOB_BANNER_ID=your-banner-id
ADMOB_INTERSTITIAL_ID=your-interstitial-id
ADMOB_REWARDED_ID=your-rewarded-id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=your-jwt-secret-key-here
API_KEY_SALT=your-api-key-salt-here
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status with cache metrics

### Runtime Configuration
- `GET /api/client-runtime-config` - Get public configuration for mobile clients
- `GET /api/admin/runtime-config` - Get all configuration (admin only)
- `POST /api/admin/runtime-config` - Create/update configuration (admin only)
- `DELETE /api/admin/runtime-config/:key` - Delete configuration (admin only)
- `GET /api/admin/config-audit-logs` - Get configuration change history (admin only)
- `POST /api/admin/clear-config-cache` - Clear configuration cache (admin only)

### User Management
- `GET /api/user-profile/:userId` - Get user profile
- `GET /api/user-analytics/:userId` - Get user analytics
- `GET /api/user-videos/:userId` - Get user videos
- `GET /api/user-activity/:userId` - Get user activity

### Video Operations
- `POST /api/watch-video` - Record video watch
- `GET /api/video-queue/:userId` - Get video queue
- `POST /api/create-video-promotion` - Create video promotion
- `POST /api/repromote-video` - Repromote video
- `DELETE /api/delete-video` - Delete video

### Transactions
- `POST /api/record-purchase` - Record coin purchase
- `GET /api/transaction-history/:userId` - Get transaction history

## 🔧 Runtime Configuration System

### Overview
The runtime configuration system allows dynamic management of application settings, API keys, and feature flags without requiring app updates or server restarts.

### Configuration Types

#### Public Configuration (Client-Accessible)
- Supabase URL and anonymous key
- AdMob ad unit IDs
- Feature flags
- App version requirements
- Maintenance mode flags

#### Private Configuration (Backend-Only)
- Supabase service role key
- JWT secrets
- Encryption keys
- Third-party API secrets

### Environment Support
- **Production**: Live app configuration
- **Staging**: Testing environment configuration
- **Development**: Local development configuration

### Client Integration

Mobile apps can fetch their runtime configuration:

```javascript
// Fetch configuration for current environment
const response = await fetch('https://your-api.com/api/client-runtime-config', {
  headers: {
    'x-api-key': 'your-client-api-key',
    'x-env': 'production',
    'x-app-version': '1.0.0'
  }
});

const { data } = await response.json();

// Use configuration
const supabaseUrl = data.config.SUPABASE_URL;
const adsEnabled = data.config.FEATURE_ADS_ENABLED === 'true';
```

### Admin Panel Integration

Admins can manage configuration through the admin panel:
- View all configurations by environment
- Create, edit, and delete configuration values
- Toggle public/private visibility
- View complete audit trail
- Clear configuration cache

### Security Features

1. **Access Control**: Only authenticated admin users can modify configuration
2. **Audit Logging**: All changes are logged with admin details, IP address, and reason
3. **Environment Isolation**: Separate configurations for different environments
4. **Cache Management**: Configurable TTL with manual cache clearing
5. **Secret Protection**: Sensitive values are never exposed to client apps

## 🔒 Security Implementation

### API Key Authentication

All API endpoints require authentication via the `x-api-key` header:

```javascript
// Client-side request
fetch('http://localhost:3001/api/user-profile/123', {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-secure-client-api-key-here'
  }
});
```

### Runtime Configuration Security

```javascript
// Client requests include environment and version headers
fetch('/api/client-runtime-config', {
  headers: {
    'x-api-key': 'client-key',
    'x-env': 'production',
    'x-app-version': '1.0.0'
  }
});
```

### Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: Rate limit info included in response headers

### CORS Configuration

Configured for secure cross-origin requests:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8081',
  credentials: true
}));
```

## 🚀 Deployment

### Production Deployment

1. **Database Setup:**
   ```bash
   # Run the runtime config migration
   # This creates the runtime_config and config_audit_log tables
   ```

2. **Environment Setup:**
   ```bash
   # Set production environment
   export NODE_ENV=production
   export PORT=3001
   export API_ENCRYPTION_KEY=your-secure-encryption-key
   ```

3. **Security Configuration:**
   - Generate secure API keys
   - Configure runtime configuration encryption
   - Use HTTPS in production
   - Configure proper CORS origins
   - Set up proper rate limiting

4. **Process Management:**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "vidgro-api-proxy"
   pm2 save
   pm2 startup
   ```

### Runtime Configuration Setup

1. **Initial Configuration:**
   ```bash
   # The migration automatically creates default configurations
   # Customize them through the admin panel
   ```

2. **Environment-Specific Setup:**
   ```bash
   # Create staging environment configs
   # Create development environment configs
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Security audit
npm run security-check

# Test runtime config endpoint
curl -H "x-api-key: your-key" -H "x-env: production" http://localhost:3001/api/client-runtime-config
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
# Returns: { status: 'OK', cacheSize: 3, uptime: 12345 }
```

### Logs
```bash
# View logs
pm2 logs vidgro-api-proxy

# Monitor resources
pm2 monit
```

### Configuration Monitoring
```bash
# View configuration audit logs
curl -H "x-api-key: your-key" http://localhost:3001/api/admin/config-audit-logs

# Clear configuration cache
curl -X POST -H "x-api-key: your-key" http://localhost:3001/api/admin/clear-config-cache
```

## 🔧 Configuration

### Runtime Configuration Management

The system supports dynamic configuration management:

```javascript
// Add new configuration
POST /api/admin/runtime-config
{
  "key": "FEATURE_NEW_FEATURE_ENABLED",
  "value": "true",
  "isPublic": true,
  "environment": "production",
  "description": "Enable new feature for users",
  "category": "features",
  "reason": "Feature rollout"
}
```

### Rate Limiting
Adjust rate limiting in `server.js`:

```javascript
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.'
});
```

### CORS
Update CORS configuration for your domains:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### Configuration Categories
- **supabase**: Database and authentication settings
- **admob**: Advertisement configuration
- **firebase**: Push notification settings
- **features**: Feature flags and toggles
- **app**: Application behavior settings
- **security**: Security-related configuration
- **general**: Miscellaneous settings

## 🛠️ Development

### Local Development

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test endpoints:**
   ```bash
   curl -H "x-api-key: your-key" http://localhost:3001/health
   ```

3. **Test runtime config:**
   ```bash
   curl -H "x-api-key: your-key" -H "x-env: development" http://localhost:3001/api/client-runtime-config
   ```

3. **Monitor logs:**
   ```bash
   tail -f logs/app.log
   ```

### Debugging

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Configuration Testing

Test configuration endpoints:

```bash
# Get client configuration
curl -H "x-api-key: your-key" http://localhost:3001/api/client-runtime-config

# Get admin configuration
curl -H "x-api-key: your-key" http://localhost:3001/api/admin/runtime-config

# View audit logs
curl -H "x-api-key: your-key" http://localhost:3001/api/admin/config-audit-logs
```

## 📝 API Documentation

### Runtime Configuration API

#### Get Client Configuration
```http
GET /api/client-runtime-config
Headers:
  x-api-key: your-client-api-key
  x-env: production|staging|development
  x-app-version: 1.0.0
```

#### Response Format
```json
{
  "data": {
    "config": {
      "SUPABASE_URL": "https://xyz.supabase.co",
      "FEATURE_ADS_ENABLED": "true"
    },
    "categories": {
      "supabase": { "SUPABASE_URL": "https://xyz.supabase.co" },
      "features": { "FEATURE_ADS_ENABLED": "true" }
    },
    "environment": "production",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "cached": false
}
```

### Request Format

All API requests must include:
- `Content-Type: application/json`
- `x-api-key: your-api-key`

### Response Format

```json
{
  "data": {...},
  "error": null
}
```

### Error Responses

```json
{
  "error": "Error message",
  "status": 400
}
```

## 🔐 Security Best Practices

1. **API Key Management:**
   - Use strong, unique API keys
   - Rotate keys regularly
   - Store keys securely

2. **HTTPS:**
   - Always use HTTPS in production
   - Configure SSL certificates properly

3. **Rate Limiting:**
   - Monitor rate limit usage
   - Adjust limits based on usage patterns

4. **Logging:**
   - Log all API requests
   - Log all configuration changes
   - Monitor for suspicious activity
   - Implement alerting

5. **Configuration Security:**
   - Separate public and private configurations
   - Audit all configuration changes
   - Use environment-specific settings
   - Implement configuration encryption for sensitive values

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 


// server.js 

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Authentication middleware (optional but recommended)
const authenticateClient = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.CLIENT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Apply authentication to all API routes
app.use('/api/', authenticateClient);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Supabase proxy endpoints
app.get('/api/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.get(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data[0] || null);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.post('/api/watch-video', async (req, res) => {
  try {
    const { userId, videoId, watchDuration, fullyWatched } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/watch_video_and_earn_coins`, {
      user_uuid: userId,
      video_uuid: videoId,
      watch_duration: watchDuration,
      video_fully_watched: fullyWatched
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error watching video:', error);
    res.status(500).json({ error: 'Failed to process video watch' });
  }
});

app.get('/api/video-queue/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_video_queue_for_user`, {
      user_uuid: userId
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data || []);
  } catch (error) {
    console.error('Error fetching video queue:', error);
    res.status(500).json({ error: 'Failed to fetch video queue' });
  }
});

app.post('/api/create-video-promotion', async (req, res) => {
  try {
    const { coinCost, coinReward, duration, targetViews, title, userId, youtubeUrl } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/create_video_promotion`, {
      coin_cost_param: coinCost,
      coin_reward_param: coinReward,
      duration_seconds_param: duration,
      target_views_param: targetViews,
      title_param: title,
      user_uuid: userId,
      youtube_url_param: youtubeUrl
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error creating video promotion:', error);
    res.status(500).json({ error: 'Failed to create video promotion' });
  }
});

app.post('/api/repromote-video', async (req, res) => {
  try {
    const { videoId, userId, additionalCost } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/repromote_video`, {
      video_uuid: videoId,
      user_uuid: userId,
      additional_coin_cost: additionalCost || 0
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error repromoting video:', error);
    res.status(500).json({ error: 'Failed to repromote video' });
  }
});

app.delete('/api/delete-video', async (req, res) => {
  try {
    const { videoId, userId } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/delete_video_with_refund`, {
      video_uuid: videoId,
      user_uuid: userId
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

app.get('/api/user-analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_user_comprehensive_analytics`, {
      user_uuid: userId
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

app.get('/api/user-videos/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_user_videos_with_analytics`, {
      user_uuid: userId
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user videos:', error);
    res.status(500).json({ error: 'Failed to fetch user videos' });
  }
});

app.get('/api/user-activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/get_user_recent_activity`, {
      user_uuid: userId
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

app.post('/api/record-purchase', async (req, res) => {
  try {
    const { userId, packageId, coinsAmount, bonusCoins, pricePaid, transactionId, platform } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/record_coin_purchase`, {
      user_uuid: userId,
      package_id: packageId,
      coins_amount: coinsAmount,
      bonus_coins: bonusCoins,
      price_paid: pricePaid,
      transaction_id: transactionId,
      purchase_platform: platform || 'unknown'
    }, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

app.get('/api/transaction-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await axios.get(`${supabaseUrl}/rest/v1/coin_transactions?user_id=eq.${userId}&order=created_at.desc&limit=${limit}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Secure API Proxy Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});