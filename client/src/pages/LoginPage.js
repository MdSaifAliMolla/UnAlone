import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
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
    console.log('🔐 Login form submitted');
    
    setError('');
    setLoading(true);

    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        navigate('/');
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('💥 Login error:', err);
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
            Welcome Back
          </h2>
          <p className="paper-text-muted">
            Sign in to continue your journey with Unalone
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
                autoComplete="current-password"
                required
                className="paper-input w-full px-4 py-3 rounded-lg paper-focus"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full paper-button py-3 px-4 rounded-lg font-medium pixel-text disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 paper-loading rounded-full"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
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
                  New to Unalone?
                </span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link 
              to="/register" 
              className="paper-button-secondary px-6 py-2 rounded-lg font-medium transition-all duration-200 pixel-text inline-block hover:paper-shadow"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="paper-text-muted text-sm pixel-text">
            Connect with people nearby and never be alone again
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;