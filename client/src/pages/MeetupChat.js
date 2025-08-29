// src/pages/MeetupChat.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Send, ArrowLeft, MapPin, Clock, User, Users } from 'lucide-react';
import { format } from 'date-fns';

const MeetupChat = () => {
  const { meetupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [meetup, setMeetup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load meetup details
  useEffect(() => {
    const loadMeetup = async () => {
      try {
        const response = await axios.get(`/api/meetups/${meetupId}`);
        setMeetup(response.data);
      } catch (error) {
        console.error('Error loading meetup:', error);
        toast.error('Meetup not found or has expired');
        navigate('/');
      }
    };

    if (meetupId) {
      loadMeetup();
    }
  }, [meetupId, navigate]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await axios.get(`/api/chat/meetup/${meetupId}/history`);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (meetupId) {
      loadChatHistory();
    }
  }, [meetupId]);

  // Socket connection for real-time chat
  useEffect(() => {
    if (socket && isConnected && meetup && user) {
      // Join the meetup room
      socket.emit('joinMeetupRoom', { meetupId, user });

      // Listen for new messages
      socket.on('newMeetupMessage', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      // Listen for user join/leave events
      socket.on('userJoinedMeetup', (data) => {
        toast.success(data.message, { duration: 3000 });
      });

      socket.on('userLeftMeetup', (data) => {
        toast(data.message, { duration: 3000 });
      });

      // Listen for meetup chat history
      socket.on('meetupChatHistory', (history) => {
        setMessages(history);
        scrollToBottom();
      });

      return () => {
        socket.emit('leaveMeetupRoom', { meetupId, user });
        socket.off('newMeetupMessage');
        socket.off('userJoinedMeetup');
        socket.off('userLeftMeetup');
        socket.off('meetupChatHistory');
      };
    }
  }, [socket, isConnected, meetup, user, meetupId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !socket) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      // Emit message through socket
      socket.emit('sendMeetupMessage', {
        meetupId,
        message: messageText,
        user
      });
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/60">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Meetup Not Found</h2>
          <p className="text-base-content/60 mb-6">This meetup may have expired or been deleted.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex-1">
            <h1 className="font-bold text-lg">{meetup.title}</h1>
            <div className="flex items-center gap-4 text-sm text-base-content/60">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{meetup.lat.toFixed(4)}, {meetup.lng.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Expires {format(new Date(meetup.expiresAt), 'MMM d, h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{meetup.ownerId === user.id ? 'Your meetup' : 'Someone else\'s meetup'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meetup Description */}
        {meetup.description && (
          <div className="mt-3 p-3 bg-base-200 rounded-lg">
            <p className="text-sm">{meetup.description}</p>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-base-200/30 p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Users className="w-16 h-16 text-base-content/20 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-base-content/60 mb-2">
              Start the conversation
            </h3>
            <p className="text-base-content/40">
              Be the first to say hello in this meetup chat!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.user.id === user.id;
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isOwnMessage && (
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full border border-base-300">
                      <img src={message.user.avatarUrl} alt={message.user.username} />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-xs md:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {!isOwnMessage && (
                    <div className="text-xs text-base-content/60 mb-1 px-3">
                      {message.user.username}
                    </div>
                  )}
                  
                  <div
                    className={`message-bubble px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-primary text-primary-content rounded-br-md'
                        : 'bg-base-100 text-base-content rounded-bl-md border border-base-300'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                  </div>
                  
                  <div className={`text-xs text-base-content/40 mt-1 px-3 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </div>
                </div>

                {isOwnMessage && (
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full border border-base-300">
                      <img src={message.user.avatarUrl} alt={message.user.username} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-base-100 border-t border-base-300 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="textarea textarea-bordered flex-1 min-h-[2.5rem] max-h-32 resize-none"
            rows="1"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || !isConnected}
            className="btn btn-primary btn-square"
          >
            {isSending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        {!isConnected && (
          <div className="text-center mt-2">
            <span className="text-xs text-warning">
              Connecting to chat...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetupChat;