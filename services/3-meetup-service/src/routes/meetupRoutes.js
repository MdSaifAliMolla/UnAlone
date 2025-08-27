const express = require('express');
const router = express.Router();
const meetupController = require('../controllers/meetupController');
const authMiddleware = require('../middleware/auth');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'meetup-service',
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.get('/all', meetupController.getAllMeetups); // Get all meetups for map
router.get('/:id', meetupController.getMeetup); // Get specific meetup

// Protected routes (require authentication)
router.post('/', authMiddleware, meetupController.createMeetup);
router.delete('/:id', authMiddleware, meetupController.deleteMeetup);
router.get('/user/my', authMiddleware, meetupController.getUserMeetups); // Changed to avoid conflict

module.exports = router;