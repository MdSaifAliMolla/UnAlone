// services/4-geospatial-service/src/controllers/geoController.js
const axios = require('axios');

// In-memory storage for meetups (replace Redis)
let meetupsStore = new Map();

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

exports.createMeetup = async (req, res) => {
  try {
    console.log('🚀 Creating meetup in geospatial service...');
    const meetupData = req.body;
    
    // Store meetup in memory
    meetupsStore.set(meetupData.id, {
      ...meetupData,
      lat: parseFloat(meetupData.lat),
      lng: parseFloat(meetupData.lng)
    });
    
    console.log('✅ Meetup stored in geospatial service');
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('💥 Create meetup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting meetup from geospatial service:', id);
    
    meetupsStore.delete(id);
    console.log('✅ Meetup deleted from geospatial service');
    
    res.json({ success: true });
  } catch (error) {
    console.error('💥 Delete meetup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.findNearby = async (req, res) => {
  try {
    console.log('🔍 Finding nearby meetups...');
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius.' });
    }

    const nearbyMeetups = [];
    const now = new Date();

    for (const [id, meetup] of meetupsStore.entries()) {
      // Check if meetup hasn't expired
      if (new Date(meetup.expiresAt) > now) {
        const distance = calculateDistance(latitude, longitude, meetup.lat, meetup.lng);
        
        if (distance <= radiusKm) {
          nearbyMeetups.push({
            ...meetup,
            distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
          });
        }
      }
    }

    // Sort by distance
    nearbyMeetups.sort((a, b) => a.distance - b.distance);

    console.log('✅ Found', nearbyMeetups.length, 'nearby meetups');
    res.json({ meetups: nearbyMeetups });
  } catch (error) {
    console.error('💥 Find nearby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMeetupById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting meetup by ID:', id);
    
    const meetup = meetupsStore.get(id);
    
    if (!meetup) {
      return res.status(404).json({ message: 'Meetup not found.' });
    }

    // Check if meetup has expired
    if (new Date(meetup.expiresAt) <= new Date()) {
      return res.status(404).json({ message: 'Meetup has expired.' });
    }

    res.json({ meetup });
  } catch (error) {
    console.error('💥 Get meetup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllMeetups = async (req, res) => {
  try {
    console.log('🔍 Getting all active meetups...');
    
    const allMeetups = [];
    const now = new Date();
    
    for (const [id, meetup] of meetupsStore.entries()) {
      if (new Date(meetup.expiresAt) > now) {
        allMeetups.push(meetup);
      }
    }
    
    // Sort by creation date
    allMeetups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('✅ Found', allMeetups.length, 'active meetups');
    res.json(allMeetups);
  } catch (error) {
    console.error('💥 Get all meetups error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};