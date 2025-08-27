import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const CreateMeetupModal = ({ isOpen, onClose, location, onMeetupCreated }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Creating meetup...');
    
    setLoading(true);
    setError('');

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(duration));

      const meetupData = {
        title: title.trim(),
        description: description.trim(),
        lat: location.lat,
        lng: location.lng,
        expiresAt: expiresAt.toISOString()
      };

      console.log('Sending meetup data:', meetupData);

      const response = await axios.post('/api/meetups', meetupData);
      
      console.log('✅ Meetup created successfully:', response.data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDuration('2');
      
      // Notify parent component
      onMeetupCreated(response.data);
      
    } catch (error) {
      console.error('💥 Error creating meetup:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create meetup. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDuration('2');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="paper-card rounded-lg paper-shadow-xl max-w-md w-full mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="paper-title text-lg font-semibold">Create New Meetup</h3>
          <button
            onClick={handleClose}
            className="paper-text-muted hover:paper-text p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 paper-focus"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm paper-shadow">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium paper-text mb-2 pixel-text">
              Meetup Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full paper-input px-3 py-2 rounded-md paper-focus"
              placeholder="e.g., Coffee chat at the park"
              required
              maxLength={100}
              disabled={loading}
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium paper-text mb-2 pixel-text">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full paper-input px-3 py-2 rounded-md paper-focus resize-none"
              placeholder="Tell people what this meetup is about..."
              required
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs paper-text-muted mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Duration Select */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium paper-text mb-2 pixel-text">
              Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full paper-input px-3 py-2 rounded-md paper-focus"
              disabled={loading}
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">1 day</option>
            </select>
          </div>

          {/* Location Info */}
          <div className="paper-card p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-blue-500">📍</span>
              <span className="text-sm font-medium paper-text pixel-text">Location</span>
            </div>
            <p className="text-xs paper-text-muted">
              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 paper-button-secondary px-4 py-2 rounded-md transition-all duration-200 pixel-text"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="flex-1 paper-button px-4 py-2 rounded-md transition-all duration-200 pixel-text disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 paper-loading rounded-full"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Meetup'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetupModal;