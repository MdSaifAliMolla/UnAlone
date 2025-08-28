const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    commandTimeout: 5000,
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔌 Redis connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('end', () => {
  console.log('🔌 Redis connection ended');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      console.log('🔌 Connecting to Redis...');
      await redisClient.connect();
      console.log('✅ Redis connected successfully');
      
      // Test the connection
      await redisClient.ping();
      console.log('✅ Redis ping successful');
    } else {
      console.log('ℹ️ Redis already connected');
    }
  } catch (error) {
    console.error('💥 Failed to connect to Redis:', error);
    throw error;
  }
};

// Graceful shutdown
const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('✅ Redis disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting Redis:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down Redis connection...');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down Redis connection...');
  await disconnectRedis();
  process.exit(0);
});

module.exports = { redisClient, connectRedis, disconnectRedis };