require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectRedis } = require('./redis/client');
const { runConsumer } = require('./kafka/consumer');
const geoRoutes = require('./routes/geoRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/geo', geoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Geospatial Service is running' });
});

// Start server
const startServer = async () => {
  try {
    await connectRedis();
    console.log('Redis connected successfully.');
    
    await runConsumer();
    console.log('Kafka consumer started successfully.');
    
    app.listen(PORT, () => {
      console.log(`Geospatial Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();