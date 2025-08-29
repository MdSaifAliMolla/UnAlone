// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MessageCircle, Clock, User, X } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

// Fix for default markers - use CDN URLs instead of require
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const meetupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="30" height="30">
      <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#ffffff" stroke-width="2" opacity="0.9"/>
      <circle cx="12" cy="12" r="6" fill="#ffffff"/>
      <circle cx="12" cy="12" r="3" fill="#ef4444"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const CreateMeetupModal = ({ isOpen, onClose, position, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('2'); // hours
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position || !title.trim() || !description.trim()) return;

    setIsLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(duration));

      const response = await axios.post('/api/meetups', {
        title: title.trim(),
        description: description.trim(),
        lat: position.lat,
        lng: position.lng,
        expiresAt: expiresAt.toISOString()
      });

      toast.success('Meetup created successfully!');
      onSuccess(response.data);
      onClose();
      setTitle('');
      setDescription('');
      setDuration('2');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create meetup');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Create New Meetup</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              type="text"
              placeholder="Coffee meetup, Walking group, etc."
              className="input input-bordered"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Describe what you'd like to do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Duration</span>
            </label>
            <select
              className="select select-bordered"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="8">8 hours</option>
              <option value="24">1 day</option>
            </select>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner loading-sm"></span>}
              Create Meetup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const Home = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [meetups, setMeetups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPosition(pos);
          loadNearbyMeetups(pos);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a location if geolocation fails
          const defaultPos = { lat: 22.5726, lng: 88.3639 }; // Kolkata
          setUserPosition(defaultPos);
          loadNearbyMeetups(defaultPos);
        }
      );
    }
  }, []);

  const loadNearbyMeetups = async (position) => {
    try {
      const response = await axios.get('/api/geo/nearby', {
        params: {
          lat: position.lat,
          lng: position.lng,
          radius: 50 // 50km radius
        }
      });
      setMeetups(response.data.meetups || []);
    } catch (error) {
      console.error('Error loading meetups:', error);
      toast.error('Failed to load nearby meetups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    setClickPosition(latlng);
    setIsModalOpen(true);
  };

  const handleMeetupCreated = (newMeetup) => {
    setMeetups(prev => [newMeetup, ...prev]);
  };

  const handleJoinMeetupChat = (meetupId) => {
    navigate(`/meetup/${meetupId}/chat`);
  };

  if (isLoading || !userPosition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/60">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-16">
      <div className="h-full relative">
        {/* Instructions */}
        <div className="absolute top-4 left-4 z-10 bg-base-100/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-base-300 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Create a meetup</span>
          </div>
          <p className="text-xs text-base-content/60">
            Click anywhere on the map to create a meetup at that location
          </p>
        </div>

        {/* Meetup Stats */}
        <div className="absolute top-4 right-4 z-10 bg-base-100/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-base-300">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{meetups.length}</div>
            <div className="text-xs text-base-content/60">Active Meetups</div>
          </div>
        </div>

        {/* Map */}
        <MapContainer
          center={[userPosition.lat, userPosition.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* User position marker */}
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-medium">You are here</div>
                <div className="text-sm text-base-content/60">
                  {userPosition.lat.toFixed(4)}, {userPosition.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Meetup markers */}
          {meetups.map((meetup) => (
            <Marker 
              key={meetup.id} 
              position={[meetup.lat, meetup.lng]} 
              icon={meetupIcon}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{meetup.title}</h3>
                    <p className="text-sm text-base-content/70">{meetup.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <Clock className="w-4 h-4" />
                    <span>Expires {format(new Date(meetup.expiresAt), 'MMM d, h:mm a')}</span>
                  </div>
                  
                  {meetup.distance && (
                    <div className="text-sm text-base-content/60">
                      📍 {meetup.distance}km away
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span>Created by {meetup.ownerId === user.id ? 'You' : 'Someone'}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleJoinMeetupChat(meetup.id)}
                    className="btn btn-primary btn-sm w-full gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Join Chat
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Create Meetup Modal */}
        <CreateMeetupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          position={clickPosition}
          onSuccess={handleMeetupCreated}
        />
      </div>
    </div>
  );
};

export default Home;