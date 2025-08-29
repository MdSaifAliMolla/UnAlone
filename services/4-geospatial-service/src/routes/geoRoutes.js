// services/4-geospatial-service/src/routes/geoRoutes.js
const express = require('express');
const geoController = require('../controllers/geoController');

const router = express.Router();

router.get('/nearby', geoController.findNearby);
router.get('/meetup/:id', geoController.getMeetupById);
router.get('/meetups', geoController.getAllMeetups);
router.post('/meetups', geoController.createMeetup);
router.delete('/meetups/:id', geoController.deleteMeetup);

module.exports = router;