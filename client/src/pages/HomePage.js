import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateMeetupModal from '../components/meetup/CreateMeetupModal';
import MeetupChat from '../components/chat/MeetupChat';
import axios from 'axios';
import L from 'leaflet';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [meetups, setMeetups] = useState([]);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          fetchNearbyMeetups(location);
        },
        () => {
          const defaultLocation = { lat: 22.5726, lng: 88.3639 };
          setUserLocation(defaultLocation);
          fetchNearbyMeetups(defaultLocation);
        }
      );
    }
  }, [isAuthenticated, navigate]);

  const fetchNearbyMeetups = async (location) => {
    try {
      const response = await axios.get('/api/geo/nearby', {
        params: { lat: location.lat, lng: location.lng, radius: 10 }
      });
      setMeetups(response.data.meetups);
    } catch (error) {
      console.error('Error fetching nearby meetups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (e) => {
    if (isAuthenticated) {
      setClickedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setShowCreateModal(true);
    }
  };

  const handleMeetupCreated = (newMeetup) => {
    setMeetups(prev => [...prev, newMeetup]);
    setShowCreateModal(false);
    setClickedLocation(null);
  };

  const handleMeetupClick = (meetup) => {
    setSelectedMeetup(meetup);
  };

  if (!isAuthenticated) return null;

  if (loading || !userLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-500 mx-auto shadow-lg"></div>
          <p className="mt-4 text-gray-300 font-medium text-lg">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <MapEvents onMapClick={handleMapClick} />

          {/* User marker */}
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <span className="font-semibold">Your location</span>
            </Popup>
          </Marker>

          {/* Meetup markers */}
          {meetups.map(meetup => (
            <Marker
              key={meetup.id}
              position={[meetup.lat, meetup.lng]}
              eventHandlers={{ click: () => handleMeetupClick(meetup) }}
            >
              <Popup>
                <div className="min-w-[200px] bg-gray-800 text-gray-100 p-2 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg">{meetup.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{meetup.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Expires: {new Date(meetup.expiresAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleMeetupClick(meetup)}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition duration-150"
                  >
                    Join Chat
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Chat Sidebar */}
      {selectedMeetup && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 shadow-lg">
          <MeetupChat
            meetup={selectedMeetup}
            onClose={() => setSelectedMeetup(null)}
          />
        </div>
      )}

      {/* Create Meetup Modal */}
      {showCreateModal && clickedLocation && (
        <CreateMeetupModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setClickedLocation(null);
          }}
          location={clickedLocation}
          onMeetupCreated={handleMeetupCreated}
        />
      )}
    </div>
  );
};

export default HomePage;
