const { Server } = require('socket.io');
const ChatMessage = require('../models/ChatMessage');

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- GLOBAL CAFE LOGIC ---
    socket.on('joinGlobalCafe', async (userProfile) => {
      try {
        socket.join('global-cafe');
        socket.userProfile = userProfile;

        console.log(`${userProfile.username} joined the Unalone Cafe`);

        // Broadcast to everyone in the room EXCEPT the sender
        socket.to('global-cafe').emit('userJoined', {
          message: `${userProfile.username} has entered the cafe.`,
          timestamp: new Date()
        });

        // Send recent chat history to the newly joined user
        const recentMessages = await ChatMessage
          .find({ roomId: 'global-cafe', roomType: 'global' })
          .sort({ timestamp: -1 })
          .limit(50);

        socket.emit('chatHistory', recentMessages.reverse());
      } catch (error) {
        console.error('Error joining global cafe:', error);
        socket.emit('error', { message: 'Failed to join cafe' });
      }
    });

    socket.on('sendGlobalMessage', async ({ message, user }) => {
      try {
        if (!message || message.trim().length === 0) {
          return;
        }

        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Save message to database
        const chatMessage = new ChatMessage({
          roomId: 'global-cafe',
          roomType: 'global',
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          message: message.trim(),
        });

        await chatMessage.save();

        // Broadcast to EVERYONE in the room including the sender
        io.to('global-cafe').emit('newMessage', {
          id: chatMessage._id,
          message: chatMessage.message,
          user: {
            id: chatMessage.userId,
            username: chatMessage.username,
            avatarUrl: chatMessage.avatarUrl
          },
          timestamp: chatMessage.timestamp
        });
      } catch (error) {
        console.error('Error sending global message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // --- MEETUP ROOM LOGIC ---
    socket.on('joinMeetupRoom', async ({ meetupId, user }) => {
      try {
        const roomName = `meetup-${meetupId}`;
        socket.join(roomName);
        socket.currentMeetupRoom = roomName;
        socket.userProfile = user;

        console.log(`${user.username} joined meetup room ${meetupId}`);

        socket.to(roomName).emit('userJoinedMeetup', {
          message: `${user.username} has joined the chat.`,
          timestamp: new Date()
        });

        // Send recent chat history for this meetup
        const recentMessages = await ChatMessage
          .find({ roomId: meetupId, roomType: 'meetup' })
          .sort({ timestamp: -1 })
          .limit(50);

        socket.emit('meetupChatHistory', recentMessages.reverse());
      } catch (error) {
        console.error('Error joining meetup room:', error);
        socket.emit('error', { message: 'Failed to join meetup room' });
      }
    });

    socket.on('sendMeetupMessage', async ({ meetupId, message, user }) => {
      try {
        if (!message || message.trim().length === 0) {
          return;
        }

        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        const roomName = `meetup-${meetupId}`;

        // Save message to database
        const chatMessage = new ChatMessage({
          roomId: meetupId,
          roomType: 'meetup',
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          message: message.trim(),
        });

        await chatMessage.save();

        // Broadcast to everyone in the meetup room
        io.to(roomName).emit('newMeetupMessage', {
          id: chatMessage._id,
          message: chatMessage.message,
          user: {
            id: chatMessage.userId,
            username: chatMessage.username,
            avatarUrl: chatMessage.avatarUrl
          },
          timestamp: chatMessage.timestamp
        });
      } catch (error) {
        console.error('Error sending meetup message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('leaveMeetupRoom', ({ meetupId, user }) => {
      const roomName = `meetup-${meetupId}`;
      socket.leave(roomName);
      socket.currentMeetupRoom = null;

      console.log(`${user.username} left meetup room ${meetupId}`);

      socket.to(roomName).emit('userLeftMeetup', {
        message: `${user.username} has left the chat.`,
        timestamp: new Date()
      });
    });

    // --- NEW: EDIT MESSAGE LOGIC ---
    socket.on('editMessage', async ({ messageId, newMessage }) => {
      try {
        const chatMessage = await ChatMessage.findById(messageId);
        if (!chatMessage) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Authorization check: Ensure the user editing the message is the owner
        if (chatMessage.userId.toString() !== socket.userProfile.id) {
          return socket.emit('error', { message: 'Unauthorized action' });
        }

        chatMessage.message = newMessage.trim();
        chatMessage.isEdited = true; // Set flag to indicate the message was edited
        await chatMessage.save();

        // Broadcast the updated message to the appropriate room
        const roomName = chatMessage.roomType === 'global' ? 'global-cafe' : `meetup-${chatMessage.roomId}`;
        io.to(roomName).emit('messageEdited', {
          id: chatMessage._id,
          message: chatMessage.message,
          isEdited: chatMessage.isEdited,
          timestamp: new Date() // Add a new timestamp for the edit
        });

      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // --- NEW: DELETE MESSAGE LOGIC ---
    socket.on('deleteMessage', async ({ messageId }) => {
      try {
        const chatMessage = await ChatMessage.findById(messageId);
        if (!chatMessage) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Authorization check
        if (chatMessage.userId.toString() !== socket.userProfile.id) {
          return socket.emit('error', { message: 'Unauthorized action' });
        }

        const roomName = chatMessage.roomType === 'global' ? 'global-cafe' : `meetup-${chatMessage.roomId}`;
        await chatMessage.deleteOne();

        // Broadcast the deletion to the appropriate room
        io.to(roomName).emit('messageDeleted', { id: messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.userProfile) {
        // Notify global cafe if user was there
        socket.to('global-cafe').emit('userLeft', {
          message: `${socket.userProfile.username} has left the cafe.`,
          timestamp: new Date()
        });

        // Notify meetup room if user was there
        if (socket.currentMeetupRoom) {
          socket.to(socket.currentMeetupRoom).emit('userLeftMeetup', {
            message: `${socket.userProfile.username} has left the chat.`,
            timestamp: new Date()
          });
        }
      }
    });
  });

  return io;
};

module.exports = { initSocketServer };