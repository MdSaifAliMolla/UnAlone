import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
//import { useTheme } from '../../context/ThemeContext';
import { ChatBubbleLeftRightIcon, MapIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  //const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="paper-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 transform hover:scale-105 transition-all duration-200 paper-focus rounded-lg p-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center paper-shadow">
              <span className="text-white font-bold text-lg pixel-text">U</span>
            </div>
            <span className="paper-title text-xl font-bold tracking-wide">Unalone</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              
              {/* Nav Links */}
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 paper-focus ${
                  isActive('/') 
                    ? 'paper-button text-white shadow-md' 
                    : 'paper-button-secondary hover:paper-shadow'
                }`}
              >
                <MapIcon className="w-5 h-5" />
                <span className="pixel-text">Map</span>
              </Link>

              <Link
                to="/cafe"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 paper-focus ${
                  isActive('/cafe') 
                    ? 'paper-button text-white shadow-md' 
                    : 'paper-button-secondary hover:paper-shadow'
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span className="pixel-text">Cafe</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg paper-button-secondary hover:paper-shadow transition-all duration-200 paper-focus">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-blue-500 paper-shadow-sm"
                  />
                  <span className="paper-text font-medium pixel-text">{user.username}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 paper-card rounded-lg paper-shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 paper-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 paper-focus mx-1"
                  >
                    <UserCircleIcon className="w-5 h-5 mr-2" />
                    <span className="pixel-text">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 paper-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 paper-focus mx-1"
                  >
                    <span className="pixel-text">Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="paper-text hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 paper-focus pixel-text"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="paper-button px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-transform transform hover:scale-105 pixel-text"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;