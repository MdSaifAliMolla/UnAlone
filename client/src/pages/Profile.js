// src/pages/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Edit3, Save, X, Sun, Moon, User, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const avatarOptions = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=2',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=3',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=5',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=6',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=7',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=8',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=9',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=10',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=11',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=12',
];

const usernameAdjectives = [
  'Quiet', 'Clever', 'Swift', 'Bright', 'Gentle', 'Bold', 'Calm', 'Wise',
  'Brave', 'Kind', 'Sharp', 'Quick', 'Cool', 'Warm', 'Free', 'Wild',
  'Pure', 'Deep', 'Light', 'Dark', 'Soft', 'Strong', 'Clear', 'Smooth'
];

const usernameNouns = [
  'Fox', 'Owl', 'Cat', 'Wolf', 'Bear', 'Eagle', 'Deer', 'Rabbit',
  'Lion', 'Tiger', 'Panda', 'Whale', 'Dolphin', 'Hawk', 'Raven', 'Swan',
  'Turtle', 'Butterfly', 'Hummingbird', 'Peacock', 'Sparrow', 'Robin', 'Falcon', 'Phoenix'
];

const generateRandomUsername = () => {
  const adjective = usernameAdjectives[Math.floor(Math.random() * usernameAdjectives.length)];
  const noun = usernameNouns[Math.floor(Math.random() * usernameNouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number}`;
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editedUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile({
        username: editedUsername.trim(),
        avatarUrl: selectedAvatar
      });
      
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUsername(user?.username || '');
    setSelectedAvatar(user?.avatarUrl || '');
    setIsEditing(false);
  };

  const handleGenerateUsername = () => {
    const newUsername = generateRandomUsername();
    setEditedUsername(newUsername);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Profile Settings</h1>
          <p className="text-base-content/60">Customize your appearance and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-6">
          <div className="card-body p-6">
            {/* Avatar Section */}
            <div className="text-center mb-6">
              <div className="avatar mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20">
                  <img 
                    src={isEditing ? selectedAvatar : user.avatarUrl} 
                    alt={user.username}
                    className="rounded-full"
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-3">Choose your avatar:</p>
                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                    {avatarOptions.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`avatar btn btn-ghost p-1 ${
                          selectedAvatar === avatar ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full">
                          <img src={avatar} alt={`Avatar ${index + 1}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              {/* Username */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </span>
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                    <button
                      onClick={handleGenerateUsername}
                      className="btn btn-outline btn-sm"
                      type="button"
                    >
                      Random
                    </button>
                  </div>
                ) : (
                  <div className="input input-bordered bg-base-200 flex items-center">
                    {user.username}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                </label>
                <div className="input input-bordered bg-base-200 flex items-center">
                  {user.email}
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Email cannot be changed
                  </span>
                </label>
              </div>

              {/* Join Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </span>
                </label>
                <div className="input input-bordered bg-base-200 flex items-center">
                  {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card-actions justify-end mt-6 pt-4 border-t border-base-300">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="btn btn-ghost gap-2"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-6">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">Appearance</h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Theme</span>
                <span className="label-text-alt text-base-content/50">
                  Choose your preferred theme
                </span>
              </label>
              
              <div className="flex gap-4">
                {/* Light Theme */}
                <div 
                  onClick={() => theme !== 'paper' && toggleTheme()}
                  className={`card card-compact bg-base-100 border-2 cursor-pointer transition-all hover:scale-105 ${
                    theme === 'paper' ? 'border-primary shadow-lg' : 'border-base-300'
                  }`}
                >
                  <div className="card-body items-center text-center p-4">
                    <Sun className="w-8 h-8 text-orange-500 mb-2" />
                    <h4 className="font-medium">Light</h4>
                    <p className="text-xs text-base-content/60">Paper theme</p>
                    {theme === 'paper' && (
                      <div className="badge badge-primary badge-sm mt-2">Active</div>
                    )}
                  </div>
                </div>

                {/* Dark Theme */}
                <div 
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`card card-compact bg-base-100 border-2 cursor-pointer transition-all hover:scale-105 ${
                    theme === 'dark' ? 'border-primary shadow-lg' : 'border-base-300'
                  }`}
                >
                  <div className="card-body items-center text-center p-4">
                    <Moon className="w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-medium">Dark</h4>
                    <p className="text-xs text-base-content/60">Dark theme</p>
                    {theme === 'dark' && (
                      <div className="badge badge-primary badge-sm mt-2">Active</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">Your Activity</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Meetups Created</div>
                <div className="stat-value text-2xl text-primary">0</div>
                <div className="stat-desc text-xs">This month</div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Chats Joined</div>
                <div className="stat-value text-2xl text-secondary">0</div>
                <div className="stat-desc text-xs">This month</div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Posts Made</div>
                <div className="stat-value text-2xl text-accent">0</div>
                <div className="stat-desc text-xs">This month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;