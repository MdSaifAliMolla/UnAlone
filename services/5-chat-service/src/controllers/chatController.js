// services/5-chat-service/src/controllers/chatController.js
const ChatMessage = require('../models/ChatMessage');
const Post = require('../models/Post');

// Posts (Global Cafe)
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post
      .find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ 
      posts,
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get Posts Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, user } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Content too long.' });
    }

    const post = new Post({
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      content: content.trim()
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const existingLike = post.likes.find(like => like.userId === user.id);
    
    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.userId !== user.id);
    } else {
      // Like
      post.likes.push({
        userId: user.id,
        username: user.username
      });
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, user } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment too long.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    post.comments.push({
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      content: content.trim()
    });

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Meetup Chat (unchanged functionality)
exports.getMeetupChatHistory = async (req, res) => {
  try {
    const { meetupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ChatMessage
      .find({ roomId: meetupId, roomType: 'meetup' })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ 
      messages: messages.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get Meetup Chat History Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};