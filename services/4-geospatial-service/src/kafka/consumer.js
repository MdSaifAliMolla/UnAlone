const { Kafka } = require('kafkajs');
const { redisClient } = require('../redis/client');

const kafka = new Kafka({
  clientId: 'geospatial-service',
  brokers: [process.env.KAFKA_BROKER_URL || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const consumer = kafka.consumer({ 
  groupId: 'geospatial-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

let isRunning = false;

const runConsumer = async () => {
  if (isRunning) return;
  
  try {
    console.log('📨 Connecting Kafka consumer...');
    await consumer.connect();
    console.log('✅ Kafka consumer connected');
    
    await consumer.subscribe({ 
      topic: 'meetup-events', 
      fromBeginning: false 
    });
    console.log('✅ Subscribed to meetup-events topic');
    
    isRunning = true;

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventKey = message.key?.toString();
          const eventValue = JSON.parse(message.value.toString());

          console.log(`📨 Received event: ${eventKey}`, {
            id: eventValue.id,
            title: eventValue.title
          });

          // Ensure Redis is connected
          if (!redisClient.isOpen) {
            console.error('❌ Redis not connected, skipping event processing');
            return;
          }

          if (eventKey === 'meetup_created') {
            console.log('📍 Processing meetup_created event...');
            
            // Add to Redis GEO index
            try {
              await redisClient.geoAdd('meetups_geo', {
                longitude: parseFloat(eventValue.lng),
                latitude: parseFloat(eventValue.lat),
                member: eventValue.id.toString(),
              });
              console.log('✅ Added to GEO index');
            } catch (geoError) {
              console.error('❌ Error adding to GEO index:', geoError);
            }
            
            // Store meetup details
            try {
              await redisClient.hSet(`meetup:${eventValue.id}`, {
                id: eventValue.id.toString(),
                title: eventValue.title,
                description: eventValue.description,
                lat: eventValue.lat.toString(),
                lng: eventValue.lng.toString(),
                ownerId: eventValue.ownerId.toString(),
                expiresAt: eventValue.expiresAt,
                createdAt: eventValue.createdAt
              });
              console.log('✅ Stored meetup details');
            } catch (storeError) {
              console.error('❌ Error storing meetup details:', storeError);
            }
            
            console.log(`✅ Processed meetup_created: ${eventValue.title}`);
          }

          if (eventKey === 'meetup_deleted') {
            console.log('🗑️ Processing meetup_deleted event...');
            
            try {
              // Remove from GEO index
              await redisClient.zRem('meetups_geo', eventValue.id.toString());
              console.log('✅ Removed from GEO index');
              
              // Remove meetup details
              await redisClient.del(`meetup:${eventValue.id}`);
              console.log('✅ Removed meetup details');
              
              console.log(`✅ Processed meetup_deleted: ${eventValue.id}`);
            } catch (deleteError) {
              console.error('❌ Error processing meetup deletion:', deleteError);
            }
          }
          
        } catch (error) {
          console.error('💥 Error processing Kafka message:', error);
        }
      },
    });
    
  } catch (error) {
    console.error('💥 Kafka consumer error:', error);
    isRunning = false;
    
    // Retry connection after delay
    console.log('🔄 Retrying Kafka connection in 5 seconds...');
    setTimeout(runConsumer, 5000);
  }
};

// Graceful shutdown
const stopConsumer = async () => {
  if (isRunning) {
    try {
      console.log('🔄 Stopping Kafka consumer...');
      await consumer.disconnect();
      isRunning = false;
      console.log('✅ Kafka consumer stopped');
    } catch (error) {
      console.error('❌ Error stopping consumer:', error);
    }
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await stopConsumer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopConsumer();
  process.exit(0);
});

module.exports = { runConsumer, stopConsumer };