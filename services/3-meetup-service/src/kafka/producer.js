const { Kafka } = require('kafkajs');

// Create Kafka instance
const kafka = new Kafka({
  clientId: 'meetup-service',
  brokers: [process.env.KAFKA_BROKER_URL || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000
});

let isConnected = false;

const connectProducer = async () => {
  try {
    console.log('📨 Connecting Kafka producer...');
    await producer.connect();
    isConnected = true;
    console.log('✅ Kafka producer connected successfully');
    
    // Create topics if they don't exist
    const admin = kafka.admin();
    await admin.connect();
    
    try {
      await admin.createTopics({
        topics: [
          {
            topic: 'meetup-events',
            numPartitions: 1,
            replicationFactor: 1
          }
        ]
      });
      console.log('✅ Kafka topics ensured');
    } catch (topicError) {
      console.log('ℹ️ Topics may already exist:', topicError.message);
    }
    
    await admin.disconnect();
    
  } catch (error) {
    console.error('❌ Failed to connect Kafka producer:', error.message);
    isConnected = false;
    throw error;
  }
};

// Graceful shutdown
const disconnectProducer = async () => {
  if (isConnected) {
    try {
      await producer.disconnect();
      isConnected = false;
      console.log('✅ Kafka producer disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Kafka producer:', error);
    }
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down Kafka producer...');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down Kafka producer...');
  await disconnectProducer();
  process.exit(0);
});

module.exports = { 
  producer, 
  connectProducer, 
  disconnectProducer,
  isConnected: () => isConnected
};