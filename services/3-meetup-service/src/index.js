// Enhanced meetup service startup (replace your index.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

console.log('🚀 Starting Meetup Service...');
console.log('🌍 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || 'not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
console.log('- KAFKA_BROKER_URL:', process.env.KAFKA_BROKER_URL ? 'Present' : 'Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes (with error handling)
let meetupRoutes;
try {
  meetupRoutes = require('./routes/meetupRoutes');
  console.log('✅ Meetup routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load meetup routes:', error);
  process.exit(1);
}

// Routes
app.use('/api/meetups', meetupRoutes);

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
  console.error('💥 Unhandled error:', error);
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
    console.log('✅ Database connection established successfully');
    
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');
    
    // Test if Meetup model works
    console.log('🧪 Testing Meetup model...');
    const { Meetup } = require('./models');
    console.log('- Meetup model loaded:', !!Meetup);
    console.log('- Meetup.create function:', typeof Meetup.create);
    
    // Try a simple query
    const count = await Meetup.count();
    console.log('- Existing meetups in DB:', count);
    console.log('✅ Meetup model test passed');
    
    // Initialize Kafka (non-blocking)
    console.log('📨 Initializing Kafka...');
    try {
      const { createProducer } = require('./kafka/producer');
      if (createProducer) {
        await createProducer();
        console.log('✅ Kafka initialized successfully');
      }
    } catch (kafkaError) {
      console.log('⚠️ Kafka initialization failed (continuing without Kafka):', kafkaError.message);
    }
    
    app.listen(PORT, () => {
      console.log('🎉 ===== MEETUP SERVICE STARTED =====');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api/meetups`);
      console.log('================================');
    });
    
  } catch (error) {
    console.error('💥 Failed to start meetup service:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection details:');
      console.error('- Check if PostgreSQL is running');
      console.error('- Verify DATABASE_URL in .env file');
      console.error('- Ensure database "unalone" exists');
    }
    
    process.exit(1);
  }
};

startServer();