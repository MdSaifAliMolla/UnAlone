import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';

const GlobalCafePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');

    if (socket && connected && user) {
      socket.emit('joinGlobalCafe', user);

      socket.on('chatHistory', (history) => setMessages(history));
      socket.on('newMessage', (message) => setMessages(prev => [...prev, message]));
      socket.on('messageEdited', (updatedMessage) => {
        setMessages(prev => prev.map(msg =>
          msg.id === updatedMessage.id ? { ...msg, message: updatedMessage.message, isEdited: updatedMessage.isEdited } : msg
        ));
      });
      socket.on('messageDeleted', ({ id }) => setMessages(prev => prev.filter(msg => msg.id !== id)));
      socket.on('userJoined', (notification) => addSystemMessage(notification.message));
      socket.on('userLeft', (notification) => addSystemMessage(notification.message));
    }

    return () => {
      if (socket) {
        socket.off('chatHistory');
        socket.off('newMessage');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('userJoined');
        socket.off('userLeft');
      }
    };
  }, [socket, connected, user, isAuthenticated, navigate]);

  const addSystemMessage = (msg) => setMessages(prev => [...prev, { id: Date.now(), message: msg, isSystemMessage: true }]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (editingMessageId) {
      if (editingMessageText.trim() && socket && user) {
        socket.emit('editMessage', { messageId: editingMessageId, newMessage: editingMessageText.trim() });
        setEditingMessageId(null);
        setEditingMessageText('');
      }
    } else {
      if (newMessage.trim() && socket && user) {
        socket.emit('sendGlobalMessage', { message: newMessage.trim(), user });
        setNewMessage('');
      }
    }
  };

  const startEdit = (msg) => { setEditingMessageId(msg.id); setEditingMessageText(msg.message); };
  const cancelEdit = () => { setEditingMessageId(null); setEditingMessageText(''); };
  const handleDelete = (id) => { if (window.confirm('Delete this message?')) socket.emit('deleteMessage', { messageId: id }); };

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-black">
        <h1 className="text-2xl font-bold">☕ Unalone Cafe</h1>
        <div className="flex items-center space-x-2 ">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`}></div>
          <span className="text-sm">{connected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-7xl mb-4 animate-bounce">☕</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to the Cafe!</h3>
            <p className="text-gray-500">Be the first to start a conversation</p>
          </div>
        ) : messages.map(msg => (
          <div
            key={msg.id || msg._id}
            className={`flex ${msg.isSystemMessage ? 'justify-center' : (msg.user?.id === user.id ? 'justify-end' : 'justify-start')}`}
          >
            {msg.isSystemMessage ? (
              <div className="w-full text-center">
                <span className="inline-block bg-white text-black text-sm px-3 py-1 rounded-full">
                  {msg.message}
                </span>
              </div>
            ) : (
              <div className={`flex items-start max-w-xl space-x-3 ${msg.user?.id === user.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <img
                  src={msg.user?.avatarUrl || msg.avatarUrl}
                  alt={msg.user?.username || msg.username}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <div className="flex-1">
                  <div className={`flex items-baseline space-x-2 ${msg.user?.id === user.id ? 'justify-end space-x-reverse' : ''}`}>
                    <span className="font-medium">{msg.user?.username || msg.username}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={`mt-1 rounded-xl px-4 py-2 shadow-md border ${msg.user?.id === user.id ? 'bg-white text-black' : 'bg-black text-white border-gray-600'}`}>
                    <p>{msg.message}</p>
                    {msg.isEdited && <span className="text-xs text-gray-400 absolute bottom-1 right-2">(edited)</span>}
                    {msg.user?.id === user.id && (
                      <div className="absolute top-1/2 -translate-y-1/2 -right-12 flex space-x-2">
                        {editingMessageId !== msg.id && (
                          <>
                            <button onClick={() => startEdit(msg)} className="text-gray-400 hover:text-white">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(msg.id)} className="text-gray-400 hover:text-red-500">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-4 border-t border-gray-700 bg-black">
        <form onSubmit={handleSendMessage} className="flex flex-1 space-x-2">
          <input
            type="text"
            value={editingMessageId ? editingMessageText : newMessage}
            onChange={(e) => editingMessageId ? setEditingMessageText(e.target.value) : setNewMessage(e.target.value)}
            placeholder={editingMessageId ? "Editing message..." : "Type a message..."}
            className="flex-1 px-5 py-3 rounded-full bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            disabled={!connected}
          />
          {editingMessageId && (
            <button type="button" onClick={cancelEdit} className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
          <button type="submit" disabled={(!newMessage.trim() && !editingMessageText.trim()) || !connected} className="bg-white text-black p-3 rounded-full hover:bg-gray-200 disabled:opacity-50">
            <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default GlobalCafePage;
