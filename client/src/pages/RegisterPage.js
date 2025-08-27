import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Registration form submitted');
    
    setError('');

    // Validation
    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await register(email.trim(), password);
      
      if (result.success) {
        console.log('✅ Registration successful, redirecting...');
        navigate('/');
      } else {
        console.log('❌ Registration failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center paper-container p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 paper-card rounded-full flex items-center justify-center paper-shadow mb-6 paper-float">
            <span className="text-blue-600 font-bold text-2xl pixel-text">U</span>
          </div>
          <h2 className="paper-title text-3xl font-bold mb-2">
            Join Unalone
          </h2>
          <p className="paper-text-muted">
            Get your random profile and start connecting with people nearby
          </p>
        </div>
        
        {/* Form Container */}
        <div className="paper-card rounded-lg paper-shadow p-8">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6 paper-shadow">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-md mb-6 paper-shadow">
            <div className="flex items-center space-x-2">
              <span>🎭</span>
              <span className="text-sm paper-text pixel-text">
                We'll generate a random username and avatar for you!
              </span>
            </div>
          </div>
          
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium paper-text mb-2 pixel-text">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="paper-input w-full px-4 py-3 rounded-lg paper-focus"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium paper-text mb-2 pixel-text">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="paper-input w-full px-4 py-3 rounded-lg paper-focus"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium paper-text mb-2 pixel-text">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="paper-input w-full px-4 py-3 rounded-lg paper-focus"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                  <span className={`pixel-text ${password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'paper-text-muted'}`}>
                    At least 6 characters
                  </span>
                </div>
                {confirmPassword && (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${password === confirmPassword ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span className={`pixel-text ${password === confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Passwords match
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              className="w-full paper-button py-3 px-4 rounded-lg font-medium pixel-text disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 paper-loading rounded-full"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 paper-container paper-text-muted pixel-text">
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link 
              to="/login" 
              className="paper-button-secondary px-6 py-2 rounded-lg font-medium transition-all duration-200 pixel-text inline-block hover:paper-shadow"
            >
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="paper-text-muted text-sm pixel-text mb-2">
            By creating an account, you agree to connect with amazing people
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs paper-text-muted">
            <span>🎭 Random Username</span>
            <span>•</span>
            <span>🖼️ Random Avatar</span>
            <span>•</span>
            <span>🔒 Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;