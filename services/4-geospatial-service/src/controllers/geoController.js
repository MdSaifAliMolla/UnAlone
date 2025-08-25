const { redisClient } = require('../redis/client');

exports.findNearby = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ message: 'Latitude, longitude, and radius are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius.' });
    }

    // Search for nearby meetups
    const nearbyMeetupIds = await redisClient.geoSearch(
      'meetups_geo',
      { longitude, latitude },
      { radius: radiusKm, unit: 'km' }
    );

    if (nearbyMeetupIds.length === 0) {
      return res.json({ meetups: [] });
    }

    // Get full details for each meetup
    const meetups = [];
    for (const meetupId of nearbyMeetupIds) {
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
        }
      }
    }

    res.json({ meetups });

  } catch (error) {
    console.error('Find Nearby Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMeetupById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meetupData = await redisClient.hGetAll(`meetup:${id}`);
    
    if (!meetupData || Object.keys(meetupData).length === 0) {
      return res.status(404).json({ message: 'Meetup not found.' });
    }

    // Check if meetup has expired
    const expiresAt = new Date(meetupData.expiresAt);
    if (expiresAt <= new Date()) {
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

    res.json({ meetup });
  } catch (error) {
    console.error('Get Meetup Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
