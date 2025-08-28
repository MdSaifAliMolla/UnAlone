require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);

const PORT = process.env.PORT || 4000;

// --- Middlewares first ---
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// --- Services ---
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  meetup: process.env.MEETUP_SERVICE_URL || 'http://localhost:3002',
  geospatial: process.env.GEOSPATIAL_SERVICE_URL || 'http://localhost:3003',
  chat: process.env.CHAT_SERVICE_URL || 'http://localhost:3004'
};

// --- Health checks ---
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    services,
    timestamp: new Date().toISOString()
  });
});

// Comprehensive health check for all services
app.get('/api/health/all', async (req, res) => {
  const healthChecks = { gateway: 'healthy' };
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const axios = require('axios');
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      healthChecks[name] = response.status === 200 ? 'healthy' : 'unhealthy';
    } catch (error) {
      healthChecks[name] = 'unreachable';
    }
  }
  
  res.json({
    services: healthChecks,
    timestamp: new Date().toISOString()
  });
});

// --- Proxy helper with body forwarding ---
const createProxy = (target, enableWs = false) => createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: enableWs,
  timeout: 30000,
  onProxyReq: (proxyReq, req) => {
    if (req.body && Object.keys(req.body).length) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    console.log(`→ Proxying ${req.method} ${req.originalUrl} → ${target}`);
  },
  onError: (err, req, res) => {
    console.error(`Proxy error for ${target}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Please try again later',
        service: target
      });
    }
  }
});

// --- Route proxies ---
app.use('/api/auth', createProxy(services.auth));
app.use('/api/meetups', createProxy(services.meetup));
app.use('/api/geo', createProxy(services.geospatial));
app.use('/api/chat', createProxy(services.chat));

// WebSocket proxy for chat service with proper upgrade handling
const wsProxy = createProxy(services.chat, true);
app.use('/socket.io', wsProxy);

// Handle WebSocket upgrade events
server.on('upgrade', (request, socket, head) => {
  console.log(`🔌 WebSocket upgrade request: ${request.url}`);
  wsProxy.upgrade(request, socket, head);
});

// --- Catch-all 404 ---
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl
  });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('Service routes:');
  console.log(`- Auth: /api/auth -> ${services.auth}`);
  console.log(`- Meetup: /api/meetups -> ${services.meetup}`);
  console.log(`- Geospatial: /api/geo -> ${services.geospatial}`);
  console.log(`- Chat: /api/chat -> ${services.chat}`);
  console.log(`- WebSocket: /socket.io -> ${services.chat}`);
  console.log(`- Health check: http://localhost:${PORT}/api/health/all`);
});