const { redisClient } = require('../redis/client');

exports.findNearby = async (req, res) => {
  try {
    console.log('🔍 Finding nearby meetups...');
    const { lat, lng, radius = 10 } = req.query;

    console.log('Query params:', { lat, lng, radius });

    if (!lat || !lng) {
      console.log('❌ Missing coordinates');
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      console.log('❌ Invalid coordinates or radius');
      return res.status(400).json({ message: 'Invalid coordinates or radius.' });
    }

    console.log('Parsed values:', { latitude, longitude, radiusKm });

    // Check if Redis is connected
    if (!redisClient.isOpen) {
      console.log('❌ Redis not connected');
      return res.status(503).json({ message: 'Geospatial service unavailable' });
    }

    try {
      // Search for nearby meetups using Redis GEOSEARCH
      console.log('🔍 Searching Redis for nearby meetups...');
      const nearbyMeetupIds = await redisClient.geoSearch(
        'meetups_geo',
        { longitude, latitude },
        { radius: radiusKm, unit: 'km' }
      );

      console.log('Found meetup IDs:', nearbyMeetupIds);

      if (nearbyMeetupIds.length === 0) {
        console.log('ℹ️ No nearby meetups found');
        return res.json({ meetups: [] });
      }

      // Get full details for each meetup
      const meetups = [];
      for (const meetupId of nearbyMeetupIds) {
        try {
          console.log('📝 Getting details for meetup:', meetupId);
          const meetupData = await redisClient.hGetAll(`meetup:${meetupId}`);
          
          if (meetupData && Object.keys(meetupData).length > 0) {
            // Check if meetup has expired
            const expiresAt = new Date(meetupData.expiresAt);
            if (expiresAt > new Date()) {
              meetups.push({
                id: meetupData.id,
                title: meetupData.title,
                description: meetupData.description,
                lat: parseFloat(meetupData.lat),
                lng: parseFloat(meetupData.lng),
                ownerId: meetupData.ownerId,
                expiresAt: meetupData.expiresAt,
                createdAt: meetupData.createdAt
              });
              console.log('✅ Added meetup to results:', meetupData.title);
            } else {
              console.log('⏰ Meetup expired, skipping:', meetupData.title);
            }
          }
        } catch (meetupError) {
          console.log('⚠️ Error getting meetup details for', meetupId, ':', meetupError.message);
        }
      }

      console.log('✅ Returning', meetups.length, 'meetups');
      res.json({ meetups });

    } catch (redisError) {
      console.error('❌ Redis error:', redisError);
      return res.status(503).json({ message: 'Geospatial search unavailable' });
    }

  } catch (error) {
    console.error('💥 Find nearby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMeetupById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting meetup by ID:', id);
    
    if (!redisClient.isOpen) {
      console.log('❌ Redis not connected');
      return res.status(503).json({ message: 'Geospatial service unavailable' });
    }
    
    const meetupData = await redisClient.hGetAll(`meetup:${id}`);
    
    if (!meetupData || Object.keys(meetupData).length === 0) {
      console.log('❌ Meetup not found in Redis');
      return res.status(404).json({ message: 'Meetup not found.' });
    }

    // Check if meetup has expired
    const expiresAt = new Date(meetupData.expiresAt);
    if (expiresAt <= new Date()) {
      console.log('⏰ Meetup expired');
      return res.status(404).json({ message: 'Meetup has expired.' });
    }

    const meetup = {
      id: meetupData.id,
      title: meetupData.title,
      description: meetupData.description,
      lat: parseFloat(meetupData.lat),
      lng: parseFloat(meetupData.lng),
      ownerId: meetupData.ownerId,
      expiresAt: meetupData.expiresAt,
      createdAt: meetupData.createdAt
    };

    console.log('✅ Meetup found');
    res.json({ meetup });
  } catch (error) {
    console.error('💥 Get meetup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};