// services/5-chat-service/src/models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  }
});

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  likes: [{
    userId: String,
    username: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  timestamp: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
postSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Post', postSchema);

// Keep the existing ChatMessage model for meetup chats
// services/5-chat-service/src/models/ChatMessage.js (unchanged)