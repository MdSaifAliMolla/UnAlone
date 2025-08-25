const express = require('express');
const router = express.Router();
const meetupController = require('../controllers/meetupController');
const authMiddleware = require('../middleware/auth'); // Assume you have this

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'meetup-service',
    timestamp: new Date().toISOString()
  });
});

// Protected routes (require authentication)
router.post('/', authMiddleware, meetupController.createMeetup);
router.delete('/:id', authMiddleware, meetupController.deleteMeetup);
router.get('/my', authMiddleware, meetupController.getUserMeetups);

// Public routes
router.get('/:id', meetupController.getMeetup);

module.exports = router;