import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import CreateMeetupModal from '../components/meetup/CreateMeetupModal';
import MeetupChat from '../components/chat/MeetupChat';
import axios from 'axios';
import L from 'leaflet';

// Fix default markers and create custom icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map event handler
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [userLocation, setUserLocation] = useState(null);
  const [meetups, setMeetups] = useState([]);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get user location
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
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Kolkata
          const defaultLocation = { lat: 22.5726, lng: 88.3639 };
          setUserLocation(defaultLocation);
          fetchNearbyMeetups(defaultLocation);
        }
      );
    } else {
      const defaultLocation = { lat: 22.5726, lng: 88.3639 };
      setUserLocation(defaultLocation);
      fetchNearbyMeetups(defaultLocation);
    }
  }, [isAuthenticated, navigate]);

  const fetchNearbyMeetups = async (location) => {
    try {
      setLoading(true);
      setError('');
      
      // Try geospatial service first
      try {
        const response = await axios.get('/api/geo/nearby', {
          params: { 
            lat: location.lat, 
            lng: location.lng, 
            radius: 50 // Increased radius
          }
        });
        
        if (response.data.meetups) {
          console.log('✅ Got meetups from geo service:', response.data.meetups.length);
          setMeetups(response.data.meetups);
        } else {
          console.log('⚠️ No meetups from geo service, trying meetup service...');
          await fetchFromMeetupService();
        }
      } catch (geoError) {
        console.log('⚠️ Geo service unavailable, trying meetup service...');
        await fetchFromMeetupService();
      }
    } catch (error) {
      console.error('❌ Error fetching meetups:', error);
      setError('Unable to load meetups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFromMeetupService = async () => {
    try {
      const response = await axios.get('/api/meetups/all');
      console.log('✅ Got meetups from meetup service:', response.data.length);
      setMeetups(response.data);
    } catch (meetupError) {
      console.error('❌ Meetup service also unavailable:', meetupError);
      throw meetupError;
    }
  };

  const handleMapClick = (e) => {
    if (isAuthenticated) {
      setClickedLocation({ 
        lat: e.latlng.lat, 
        lng: e.latlng.lng 
      });
      setShowCreateModal(true);
    }
  };

  const handleMeetupCreated = (newMeetup) => {
    console.log('✅ Meetup created:', newMeetup);
    setMeetups(prev => [...prev, newMeetup]);
    setShowCreateModal(false);
    setClickedLocation(null);
  };

  const handleMeetupClick = (meetup) => {
    setSelectedMeetup(meetup);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen paper-container">
        <div className="text-center">
          <div className="paper-loading w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="paper-text font-medium text-lg pixel-text">Loading your map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen paper-container">
        <div className="text-center paper-card p-8 rounded-lg">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="paper-title text-xl font-semibold mb-2">Unable to Load Map</h3>
          <p className="paper-text-muted mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="paper-button px-4 py-2 rounded-lg pixel-text"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-screen paper-container">
        <div className="text-center">
          <div className="paper-loading w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="paper-text font-medium text-lg pixel-text">Getting your location...</p>
        </div>
      </div>
    );
  }

  // Tile layer URL for light/dark theme
  const tileLayerUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="flex h-screen paper-container">
      
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            url={tileLayerUrl}
            attribution={attribution}
            className="transition-all duration-300"
          />
          <MapEvents onMapClick={handleMapClick} />

          {/* User location marker */}
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            title="Your location"
          >
            <Popup className="paper-popup">
              <div className="paper-card p-2 text-center">
                <span className="paper-text font-semibold pixel-text">📍 You are here</span>
              </div>
            </Popup>
          </Marker>

          {/* Meetup markers */}
          {meetups.map(meetup => (
            <Marker
              key={meetup.id}
              position={[meetup.lat, meetup.lng]}
              eventHandlers={{ 
                click: () => handleMeetupClick(meetup) 
              }}
              title={meetup.title}
            >
              <Popup className="paper-popup">
                <div className="paper-card p-3 min-w-[200px]">
                  <h3 className="paper-text font-semibold text-lg mb-1 pixel-text">
                    {meetup.title}
                  </h3>
                  <p className="paper-text-muted text-sm mb-2">
                    {meetup.description}
                  </p>
                  <p className="paper-text-muted text-xs mb-3">
                    ⏰ Expires: {new Date(meetup.expiresAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleMeetupClick(meetup)}
                    className="w-full paper-button px-3 py-2 rounded-lg text-sm transition-all duration-150 pixel-text"
                  >
                    💬 Join Chat
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating meetup counter */}
        {meetups.length > 0 && (
          <div className="absolute top-4 left-4 z-20 paper-card px-4 py-2 rounded-full paper-shadow">
            <span className="paper-text text-sm font-medium pixel-text">
              📍 {meetups.length} meetup{meetups.length !== 1 ? 's' : ''} nearby
            </span>
          </div>
        )}

        {/* Instructions overlay */}
        {meetups.length === 0 && !loading && (
          <div className="absolute bottom-4 left-4 right-4 z-20 paper-card p-4 rounded-lg paper-shadow text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <h3 className="paper-title text-lg font-semibold mb-1">No meetups nearby</h3>
            <p className="paper-text-muted text-sm pixel-text">
              Click anywhere on the map to create the first meetup in this area!
            </p>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      {selectedMeetup && (
        <div className="w-96 paper-card border-l-2 border-gray-200 dark:border-gray-700 paper-shadow-lg">
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