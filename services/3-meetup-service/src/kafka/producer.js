const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'meetup-service',
  brokers: [process.env.KAFKA_BROKER_URL || 'localhost:9092'] // Add fallback
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Meetup service producer connected to Kafka');
  } catch (error) {
    console.error('Kafka producer connection error:', error);
    throw error;
  }
};

module.exports = { producer, connectProducer };