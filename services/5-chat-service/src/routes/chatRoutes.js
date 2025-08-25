const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/global/history', chatController.getGlobalChatHistory);
router.get('/meetup/:meetupId/history', chatController.getMeetupChatHistory);

module.exports = router;