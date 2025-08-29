// services/5-chat-service/src/routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Posts routes (Global Cafe)
router.get('/posts', chatController.getPosts);
router.post('/posts', chatController.createPost);
router.post('/posts/:postId/like', chatController.likePost);
router.post('/posts/:postId/comment', chatController.addComment);

// Meetup chat routes
router.get('/meetup/:meetupId/history', chatController.getMeetupChatHistory);

module.exports = router;