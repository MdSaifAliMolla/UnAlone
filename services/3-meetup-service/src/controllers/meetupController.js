const { Meetup } = require('../models');
const axios = require('axios');

// use the URL defined in docker-compose.yml
const GEOSPATIAL_URL = process.env.GEOSPATIAL_SERVICE_URL || 'http://localhost:3003';

exports.createMeetup = async (req, res) => {
  console.log('🚀 Creating meetup...');
  console.log('Request body:', req.body);
  console.log('User:', req.user);

  try {
    const { title, description, lat, lng, expiresAt } = req.body;
    const ownerId = req.user.id;

    // Validation
    if (!title || !description || lat === undefined || lng === undefined || !expiresAt) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Date validation
    const expiry = new Date(expiresAt);
    if (isNaN(expiry.getTime())) {
      console.log('❌ Invalid date format');
      return res.status(400).json({ message: 'Invalid date format.' });
    }
    if (expiry <= new Date()) {
      console.log('❌ Date must be in future');
      return res.status(400).json({ message: 'Expiry date must be in the future.' });
    }

    // Coordinate validation
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      console.log('❌ Invalid coordinates');
      return res.status(400).json({ message: 'Invalid coordinates.' });
    }

    // Create meetup
    const meetupData = {
      title,
      description,
      lat: parsedLat,
      lng: parsedLng,
      expiresAt: expiry,
      ownerId,
    };

    console.log('💾 Creating meetup in database...');
    const meetup = await Meetup.create(meetupData);
    console.log('✅ Meetup created:', meetup.id);

    // 🔥 Call Geospatial Service to add to Redis
    try {
      console.log('📡 Sending meetup to Geospatial Service...');
      await axios.post(`${GEOSPATIAL_URL}/meetups`, {
        id: meetup.id,
        title: meetup.title,
        description: meetup.description,
        lat: meetup.lat,
        lng: meetup.lng,
        expiresAt: meetup.expiresAt,
        ownerId: meetup.ownerId,
        createdAt: meetup.createdAt,
      }, { timeout: 5000 });
      console.log('✅ Sent meetup to Geospatial Service');
    } catch (geoError) {
      console.log('⚠️ Geospatial service error (non-critical):', geoError.message);
    }

    res.status(201).json(meetup);

  } catch (error) {
    console.error('💥 Create meetup error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors?.map(e => e.message) || []
      });
    }

    res.status(500).json({ message: 'Server error creating meetup.' });
  }
};

exports.deleteMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    console.log('🗑️ Deleting meetup:', id, 'by user:', ownerId);

    const meetup = await Meetup.findOne({ where: { id, ownerId } });
    if (!meetup) {
      console.log('❌ Meetup not found or unauthorized');
      return res.status(404).json({ message: 'Meetup not found or unauthorized.' });
    }

    await meetup.destroy();
    console.log('✅ Meetup deleted from database');

    // 🔥 Call Geospatial Service to remove from Redis
    try {
      console.log('📡 Removing meetup from Geospatial Service...');
      await axios.delete(`${GEOSPATIAL_URL}/meetups/${id}`, { timeout: 5000 });
      console.log('✅ Removed meetup from Geospatial Service');
    } catch (geoError) {
      console.log('⚠️ Geospatial service error (non-critical):', geoError.message);
    }

    res.json({ message: 'Meetup deleted successfully.' });
  } catch (error) {
    console.error('💥 Delete meetup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting meetup:', id);

    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      console.log('❌ Meetup not found');
      return res.status(404).json({ message: 'Meetup not found.' });
    }

    // Check expiry
    if (new Date() > meetup.expiresAt) {
      console.log('❌ Meetup expired');
      return res.status(404).json({ message: 'Meetup has expired.' });
    }

    console.log('✅ Meetup found');
    res.json(meetup);
  } catch (error) {
    console.error('💥 Get meetup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserMeetups = async (req, res) => {
  try {
    const ownerId = req.user.id;
    console.log('👤 Getting meetups for user:', ownerId);

    const meetups = await Meetup.findAll({
      where: { ownerId },
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Found', meetups.length, 'meetups for user');
    res.json(meetups);
  } catch (error) {
    console.error('💥 Get user meetups error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllMeetups = async (req, res) => {
  try {
    console.log('🔍 Getting all active meetups...');

    // Get all non-expired meetups
    const meetups = await Meetup.findAll({
      where: {
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 100 // Reasonable limit
    });

    console.log('✅ Found', meetups.length, 'active meetups');
    res.json(meetups);
  } catch (error) {
    console.error('💥 Get all meetups error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};