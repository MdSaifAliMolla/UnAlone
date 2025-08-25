import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

const MeetupChat = ({ meetup, onClose }) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket && connected && user && meetup) {
      // Join the meetup room
      socket.emit('joinMeetupRoom', {
        meetupId: meetup.id,
        user: user
      });

      // Listen for chat events
      socket.on('meetupChatHistory', (history) => {
        setMessages(history);
      });

      socket.on('newMeetupMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('userJoinedMeetup', (notification) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: notification.message,
          timestamp: notification.timestamp,
          isSystemMessage: true
        }]);
      });

      socket.on('userLeftMeetup', (notification) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: notification.message,
          timestamp: notification.timestamp,
          isSystemMessage: true
        }]);
      });

      return () => {
        socket.emit('leaveMeetupRoom', {
          meetupId: meetup.id,
          user: user
        });
        
        socket.off('meetupChatHistory');
        socket.off('newMeetupMessage');
        socket.off('userJoinedMeetup');
        socket.off('userLeftMeetup');
      };
    }
  }, [socket, connected, user, meetup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      socket.emit('sendMeetupMessage', {
        meetupId: meetup.id,
        message: newMessage.trim(),
        user: user
      });
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{meetup.title}</h3>
            <p className="text-sm text-gray-600 truncate">{meetup.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs text-gray-500">
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id || msg._id}>
              {msg.isSystemMessage ? (
                <div className="text-center">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <img
                    src={msg.user?.avatarUrl || msg.avatarUrl}
                    alt={msg.user?.username || msg.username}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-sm font-medium text-gray-900">
                        {msg.user?.username || msg.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-100 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-800">{msg.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-3">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={1000}
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MeetupChat;
