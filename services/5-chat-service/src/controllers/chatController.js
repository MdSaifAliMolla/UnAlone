const ChatMessage = require('../models/ChatMessage');

exports.getGlobalChatHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ChatMessage
      .find({ roomId: 'global-cafe', roomType: 'global' })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ 
      messages: messages.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get Global Chat History Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

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
