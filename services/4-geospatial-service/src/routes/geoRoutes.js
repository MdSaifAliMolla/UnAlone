const express = require('express');
const geoController = require('../controllers/geoController');

const router = express.Router();

router.get('/nearby', geoController.findNearby);
router.get('/meetup/:id', geoController.getMeetupById);

module.exports = router;