import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';

const GlobalCafePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket, connected } = useSocket();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (socket && connected && user) {
      console.log('📡 Joining global cafe...');
      socket.emit('joinGlobalCafe', user);

      // Socket event listeners
      socket.on('chatHistory', (history) => {
        console.log('📜 Received chat history:', history.length, 'messages');
        setMessages(history);
      });
      
      socket.on('newMessage', (message) => {
        console.log('💬 New message received:', message);
        setMessages(prev => [...prev, message]);
      });
      
      socket.on('messageEdited', (updatedMessage) => {
        console.log('✏️ Message edited:', updatedMessage);
        setMessages(prev => prev.map(msg =>
          msg.id === updatedMessage.id || msg._id === updatedMessage.id
            ? { ...msg, message: updatedMessage.message, isEdited: true }
            : msg
        ));
      });
      
      socket.on('messageDeleted', ({ id }) => {
        console.log('🗑️ Message deleted:', id);
        setMessages(prev => prev.filter(msg => msg.id !== id && msg._id !== id));
      });
      
      socket.on('userJoined', (notification) => {
        console.log('👋 User joined:', notification);
        addSystemMessage(notification.message);
      });
      
      socket.on('userLeft', (notification) => {
        console.log('👋 User left:', notification);
        addSystemMessage(notification.message);
      });

      socket.on('error', (error) => {
        console.error('🚨 Socket error:', error);
      });

      return () => {
        console.log('🔌 Cleaning up socket listeners...');
        socket.off('chatHistory');
        socket.off('newMessage');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('userJoined');
        socket.off('userLeft');
        socket.off('error');
      };
    }
  }, [socket, connected, user, isAuthenticated, navigate]);

  const addSystemMessage = (msg) => {
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      message: msg, 
      isSystemMessage: true,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (editingMessageId) {
      // Edit existing message
      if (editingMessageText.trim() && socket && user) {
        console.log('✏️ Editing message:', editingMessageId);
        socket.emit('editMessage', { 
          messageId: editingMessageId, 
          newMessage: editingMessageText.trim() 
        });
        setEditingMessageId(null);
        setEditingMessageText('');
      }
    } else {
      // Send new message
      if (newMessage.trim() && socket && user) {
        console.log('💬 Sending message:', newMessage.trim());
        socket.emit('sendGlobalMessage', { 
          message: newMessage.trim(), 
          user 
        });
        setNewMessage('');
      }
    }
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg.id || msg._id);
    setEditingMessageText(msg.message);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleDelete = (msgId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      console.log('🗑️ Deleting message:', msgId);
      socket.emit('deleteMessage', { messageId: msgId });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen paper-container">
      
      {/* Header */}
      <div className="paper-nav p-6 border-b-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl paper-float">☕</div>
            <div>
              <h1 className="paper-title text-2xl font-bold pixel-text">Unalone Cafe</h1>
              <p className="paper-text-muted text-sm">Connect with people around the world</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'} paper-shadow`}></div>
            <span className={`text-sm pixel-text ${connected ? 'paper-text' : 'text-red-500'}`}>
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 paper-float">☕</div>
            <h3 className="paper-title text-2xl font-semibold mb-3">Welcome to the Cafe!</h3>
            <p className="paper-text-muted text-lg mb-6">
              This is where strangers become friends
            </p>
            <div className="paper-card p-4 rounded-lg max-w-md mx-auto">
              <p className="paper-text text-sm pixel-text">
                💡 Be the first to start a conversation and make someone's day brighter!
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id || msg._id}
              className={`flex ${msg.isSystemMessage ? 'justify-center' : (msg.user?.id === user.id ? 'justify-end' : 'justify-start')}`}
            >
              {msg.isSystemMessage ? (
                <div className="text-center">
                  <span className="inline-block paper-card px-3 py-1 rounded-full text-sm paper-text-muted pixel-text">
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div className={`flex items-start max-w-2xl space-x-3 ${
                  msg.user?.id === user.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  
                  {/* Avatar */}
                  <img
                    src={msg.user?.avatarUrl || msg.avatarUrl}
                    alt={msg.user?.username || msg.username}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 paper-shadow flex-shrink-0"
                  />
                  
                  {/* Message Content */}
                  <div className="flex-1 relative group">
                    <div className={`flex items-baseline space-x-2 mb-1 ${
                      msg.user?.id === user.id ? 'justify-end flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <span className="paper-text font-medium text-sm pixel-text">
                        {msg.user?.username || msg.username}
                      </span>
                      <span className="paper-text-muted text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {msg.isEdited && (
                        <span className="paper-text-muted text-xs italic">(edited)</span>
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`message-bubble px-4 py-3 relative ${
                      msg.user?.id === user.id ? 'message-bubble own' : ''
                    }`}>
                      <p className="paper-text break-words">{msg.message}</p>
                      
                      {/* Message Actions */}
                      {msg.user?.id === user.id && (
                        <div className={`absolute ${
                          msg.user?.id === user.id ? 'left-0 -ml-16' : 'right-0 -mr-16'
                        } top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                          <div className="flex space-x-1">
                            {editingMessageId !== (msg.id || msg._id) && (
                              <>
                                <button
                                  onClick={() => startEdit(msg)}
                                  className="p-1 rounded-full paper-card hover:paper-shadow transition-all duration-200 paper-focus"
                                  title="Edit message"
                                >
                                  <PencilIcon className="w-4 h-4 paper-text-muted hover:paper-text" />
                                </button>
                                <button
                                  onClick={() => handleDelete(msg.id || msg._id)}
                                  className="p-1 rounded-full paper-card hover:paper-shadow transition-all duration-200 paper-focus"
                                  title="Delete message"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="paper-nav border-t-2 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <input
              type="text"
              value={editingMessageId ? editingMessageText : newMessage}
              onChange={(e) => editingMessageId ? setEditingMessageText(e.target.value) : setNewMessage(e.target.value)}
              placeholder={editingMessageId ? "Edit your message..." : "Share your thoughts with the world..."}
              className="w-full paper-input px-4 py-3 rounded-full text-base paper-focus"
              disabled={!connected}
              maxLength={1000}
            />
          </div>
          
          {/* Cancel Edit Button */}
          {editingMessageId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="p-3 paper-card rounded-full hover:paper-shadow transition-all duration-200 paper-focus"
              title="Cancel edit"
            >
              <XMarkIcon className="w-5 h-5 paper-text-muted hover:paper-text" />
            </button>
          )}
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={
              (!newMessage.trim() && !editingMessageText.trim()) || 
              !connected
            }
            className="paper-button p-3 rounded-full disabled:opacity-50 transition-all duration-200 paper-focus"
            title={editingMessageId ? "Save changes" : "Send message"}
          >
            <PaperAirplaneIcon className="w-5 h-5 transform rotate-45" />
          </button>
        </form>
        
        {/* Connection Status */}
        {!connected && (
          <div className="text-center mt-2">
            <span className="text-sm text-red-500 pixel-text">
              🔌 Reconnecting to cafe...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalCafePage;