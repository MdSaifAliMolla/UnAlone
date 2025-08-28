require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectRedis } = require('./redis/client');
const geoRoutes = require('./routes/geoRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

console.log('🚀 Starting Geospatial Service...');
console.log('Environment check:', {
  PORT,
  REDIS_URL: process.env.REDIS_URL ? 'Present' : 'Missing'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/', geoRoutes); // Changed from '/api/geo' since gateway handles prefix

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Geospatial Service is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Geospatial service error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔌 Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connected successfully');
    
    app.listen(PORT, () => {
      console.log('🎉 ===== GEOSPATIAL SERVICE STARTED =====');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log('=====================================');
    });
    
  } catch (error) {
    console.error('💥 Failed to start geospatial service:', error);
    process.exit(1);
  }
};

startServer();