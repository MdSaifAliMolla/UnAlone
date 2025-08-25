// Replace your meetup controller with this comprehensive debug version
const { Meetup } = require('../models');
const { producer } = require('../kafka/producer');

exports.createMeetup = async (req, res) => {
  console.log('🚀 ===== MEETUP CREATION DEBUG START =====');
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User from auth:', req.user);
  console.log('🌍 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
    KAFKA_BROKER_URL: process.env.KAFKA_BROKER_URL ? 'Present' : 'Missing'
  });

  try {
    const { title, description, lat, lng, expiresAt } = req.body;
    const ownerId = req.user.id;

    console.log('📋 Extracted data:', {
      title,
      description,
      lat: { value: lat, type: typeof lat },
      lng: { value: lng, type: typeof lng },
      expiresAt,
      ownerId
    });

    // Validation
    console.log('✅ Starting validation...');
    if (!title || !description || lat === undefined || lng === undefined || !expiresAt) {
      console.log('❌ Validation failed - missing fields');
      console.log('Field presence check:', {
        title: !!title,
        description: !!description,
        lat: lat !== undefined,
        lng: lng !== undefined,
        expiresAt: !!expiresAt
      });
      return res.status(400).json({ message: 'All fields are required.' });
    }
    console.log('✅ All required fields present');

    // Date validation
    console.log('🕒 Validating date...');
    console.log('Received expiresAt:', expiresAt);
    const expiry = new Date(expiresAt);
    console.log('Parsed expiry date:', expiry);
    console.log('Is valid date:', !isNaN(expiry.getTime()));
    console.log('Current date:', new Date());
    console.log('Is future date:', expiry > new Date());

    if (isNaN(expiry.getTime())) {
      console.log('❌ Invalid date format');
      return res.status(400).json({ message: 'Invalid date format for expiresAt.' });
    }

    if (expiry <= new Date()) {
      console.log('❌ Date is not in future');
      return res.status(400).json({ message: 'Expiry date must be in the future.' });
    }
    console.log('✅ Date validation passed');

    // Coordinate processing
    console.log('📍 Processing coordinates...');
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    console.log('Parsed coordinates:', {
      lat: { original: lat, parsed: parsedLat, isValid: !isNaN(parsedLat) },
      lng: { original: lng, parsed: parsedLng, isValid: !isNaN(parsedLng) }
    });

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      console.log('❌ Invalid coordinates');
      return res.status(400).json({ message: 'Invalid coordinates.' });
    }
    console.log('✅ Coordinates validated');

    // Check if Meetup model is available
    console.log('🏗️ Checking Meetup model...');
    console.log('Meetup model available:', !!Meetup);
    console.log('Meetup.create function:', typeof Meetup.create);

    if (!Meetup || typeof Meetup.create !== 'function') {
      console.log('❌ Meetup model not properly loaded');
      return res.status(500).json({ message: 'Database model error.' });
    }
    console.log('✅ Meetup model is ready');

    // Prepare data for database
    const meetupData = {
      title,
      description,
      lat: parsedLat,
      lng: parsedLng,
      expiresAt: expiry,
      ownerId,
    };
    console.log('💾 Data to create in database:', JSON.stringify(meetupData, null, 2));

    // Database operation
    console.log('🗄️ Creating meetup in database...');
    const meetup = await Meetup.create(meetupData);
    console.log('✅ Meetup created successfully in database');
    console.log('📄 Created meetup details:', {
      id: meetup.id,
      title: meetup.title,
      lat: meetup.lat,
      lng: meetup.lng,
      createdAt: meetup.createdAt,
      dataValues: meetup.dataValues
    });

    // Kafka handling
    console.log('📨 Preparing Kafka event...');
    console.log('Producer available:', !!producer);
    
    if (producer && typeof producer.send === 'function') {
      try {
        console.log('📤 Sending to Kafka...');
        const kafkaMessage = {
          topic: 'meetup-events',
          messages: [
            {
              key: 'meetup_created',
              value: JSON.stringify({
                id: meetup.id,
                title: meetup.title,
                description: meetup.description,
                lat: meetup.lat,
                lng: meetup.lng,
                expiresAt: meetup.expiresAt,
                ownerId: meetup.ownerId,
                createdAt: meetup.createdAt
              }),
            },
          ],
        };
        console.log('Kafka message:', JSON.stringify(kafkaMessage, null, 2));
        
        await producer.send(kafkaMessage);
        console.log('✅ Kafka event sent successfully');
      } catch (kafkaError) {
        console.log('⚠️ Kafka error (non-critical):', kafkaError.message);
        console.log('Continuing without Kafka event...');
      }
    } else {
      console.log('⚠️ Kafka producer not available, skipping event');
    }

    console.log('🎉 Meetup creation completed successfully');
    console.log('📤 Sending response:', {
      id: meetup.id,
      title: meetup.title,
      status: 'success'
    });
    
    res.status(201).json(meetup);
    console.log('✅ Response sent successfully');

  } catch (error) {
    console.log('💥 ===== ERROR OCCURRED =====');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Specific error handling
    if (error.name === 'SequelizeValidationError') {
      console.log('🔍 Sequelize validation error details:', error.errors);
      return res.status(400).json({ 
        message: 'Database validation failed', 
        errors: error.errors?.map(e => e.message) || []
      });
    }
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('🔍 Database connection error');
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      console.log('🔍 Database error details:', error.original);
      return res.status(500).json({ message: 'Database operation failed' });
    }
    
    console.log('🔍 Generic error - sending 500 response');
    res.status(500).json({ message: 'Server error.' });
  } finally {
    console.log('🏁 ===== MEETUP CREATION DEBUG END =====\n');
  }
};

// Keep other methods as they were
exports.deleteMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const meetup = await Meetup.findOne({ where: { id, ownerId } });
    if (!meetup) {
      return res.status(404).json({ message: 'Meetup not found or you are not the owner.' });
    }

    await meetup.destroy();

    // Produce delete event to Kafka (with error handling)
    if (producer && typeof producer.send === 'function') {
      try {
        await producer.send({
          topic: 'meetup-events',
          messages: [
            {
              key: 'meetup_deleted',
              value: JSON.stringify({
                id: meetup.id,
                ownerId: meetup.ownerId
              }),
            },
          ],
        });
      } catch (kafkaError) {
        console.log('Kafka error during delete (non-critical):', kafkaError.message);
      }
    }

    res.json({ message: 'Meetup deleted successfully.' });
  } catch (error) {
    console.error('Delete Meetup Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMeetup = async (req, res) => {
  try {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      return res.status(404).json({ message: 'Meetup not found.' });
    }

    // Check if meetup has expired
    if (new Date() > meetup.expiresAt) {
      return res.status(404).json({ message: 'Meetup has expired.' });
    }

    res.json(meetup);
  } catch (error) {
    console.error('Get Meetup Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserMeetups = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const meetups = await Meetup.findAll({
      where: { ownerId },
      order: [['createdAt', 'DESC']]
    });

    res.json(meetups);
  } catch (error) {
    console.error('Get User Meetups Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};