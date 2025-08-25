import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChatBubbleLeftRightIcon, MapIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 transform hover:scale-105 transition-transform duration-200">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-lg">U</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-wide">Unalone</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              
              {/* Nav Links */}
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <MapIcon className="w-5 h-5" />
                <span>Map</span>
              </Link>

              <Link
                to="/cafe"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive('/cafe') 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Cafe</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 transition duration-200">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-blue-500 shadow-sm"
                  />
                  <span className="text-gray-200 font-medium">{user.username}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-150"
                  >
                    <UserCircleIcon className="w-5 h-5 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-transform transform hover:scale-105"
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
