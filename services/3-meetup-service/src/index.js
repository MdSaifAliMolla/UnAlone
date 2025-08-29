// services/3-meetup-service/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

console.log('🚀 Starting Meetup Service...');
console.log('Environment check:', {
  PORT: process.env.PORT || 3002,
  DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
  GEOSPATIAL_SERVICE_URL: process.env.GEOSPATIAL_SERVICE_URL || 'http://localhost:5003',
  JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing'
});

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json());

// Import routes
let meetupRoutes;
try {
  meetupRoutes = require('./routes/meetupRoutes');
  console.log('✅ Meetup routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load meetup routes:', error);
  process.exit(1);
}

// Routes
app.use('/', meetupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Meetup Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Meetup service error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');
    
    // Test Meetup model
    console.log('🧪 Testing Meetup model...');
    const { Meetup } = require('./models');
    const count = await Meetup.count();
    console.log('✅ Meetup model working, existing meetups:', count);
    
    app.listen(PORT, () => {
      console.log('🎉 ===== MEETUP SERVICE STARTED =====');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log('=================================');
    });
    
  } catch (error) {
    console.error('💥 Failed to start meetup service:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection details:');
      console.error('- Check if PostgreSQL is running');
      console.error('- Verify DATABASE_URL in environment');
      console.error('- Ensure database "unalone" exists');
    }
    
    process.exit(1);
  }
};

startServer();