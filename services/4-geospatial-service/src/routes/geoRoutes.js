const express = require('express');
const geoController = require('../controllers/geoController');

const router = express.Router();

router.get('/nearby', geoController.findNearby);
router.get('/meetup/:id', geoController.getMeetupById);

// New routes to handle direct calls from meetup service
router.post('/meetups', geoController.addMeetup);
router.delete('/meetups/:id', geoController.deleteMeetup);

module.exports = router;