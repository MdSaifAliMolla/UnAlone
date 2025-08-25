const { Kafka } = require('kafkajs');
const { redisClient } = require('../redis/client');

const kafka = new Kafka({
  clientId: 'geospatial-service',
  brokers: [process.env.KAFKA_BROKER_URL || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'geospatial-group' });

const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'meetup-events', fromBeginning: false });
    console.log('Geospatial consumer connected and subscribed');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventKey = message.key.toString();
          const eventValue = JSON.parse(message.value.toString());

          console.log(`Received event: ${eventKey}`, eventValue);

          if (eventKey === 'meetup_created') {
            // Add the new meetup to our Redis GEO index
            await redisClient.geoAdd('meetups_geo', {
              longitude: parseFloat(eventValue.lng),
              latitude: parseFloat(eventValue.lat),
              member: eventValue.id.toString(),
            });
            
            // Store meetup details for quick lookup
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
            
            console.log(`Added meetup ${eventValue.id} to GEO index and stored details.`);
          }

          if (eventKey === 'meetup_deleted') {
            // Remove the meetup from the GEO index
            await redisClient.zRem('meetups_geo', eventValue.id.toString());
            // Remove meetup details
            await redisClient.del(`meetup:${eventValue.id}`);
            console.log(`Removed meetup ${eventValue.id} from GEO index and details.`);
          }
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Kafka consumer connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(runConsumer, 5000);
  }
};

module.exports = { runConsumer };