require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting Auth Service...');
console.log('Environment check:', {
  PORT,
  DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Routes
app.use('/', authRoutes); // Changed from '/api/auth' to '/' since gateway handles the prefix

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Auth Service is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Auth Service Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synced');
    
    app.listen(PORT, () => {
      console.log('🎉 ===== AUTH SERVICE STARTED =====');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log('================================');
    });
  } catch (error) {
    console.error('💥 Failed to start auth service:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection issue:');
      console.error('- Check if PostgreSQL is running');
      console.error('- Verify DATABASE_URL in environment');
    }
    
    process.exit(1);
  }
};

startServer();