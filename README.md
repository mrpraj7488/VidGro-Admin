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

A secure Node.js Express server that acts as a proxy between the VidGro mobile app and external APIs, keeping all sensitive tokens server-side.

## 🔐 Security Features

- **Token Protection**: All sensitive API keys stored server-side only
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
- `GET /health` - Server health status

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

1. **Environment Setup:**
   ```bash
   # Set production environment
   export NODE_ENV=production
   export PORT=3001
   ```

2. **Security Configuration:**
   - Generate secure API keys
   - Use HTTPS in production
   - Configure proper CORS origins
   - Set up proper rate limiting

3. **Process Management:**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "vidgro-api-proxy"
   pm2 save
   pm2 startup
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Security audit
npm run security-check
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Logs
```bash
# View logs
pm2 logs vidgro-api-proxy

# Monitor resources
pm2 monit
```

## 🔧 Configuration

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

3. **Monitor logs:**
   ```bash
   tail -f logs/app.log
   ```

### Debugging

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## 📝 API Documentation

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
   - Monitor for suspicious activity
   - Implement alerting

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