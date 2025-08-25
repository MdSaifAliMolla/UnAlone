import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">Your username was randomly generated when you signed up</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar</label>
                <div className="mt-1 flex items-center space-x-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="text-xs text-gray-500">Your avatar was randomly assigned</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
            <p className="text-sm text-gray-600">
              Profile customization features coming soon! For now, enjoy your randomly generated identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
