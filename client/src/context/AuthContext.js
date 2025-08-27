import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Initializing auth...');
      
      if (token) {
        try {
          console.log('🔍 Verifying existing token...');
          const response = await axios.get('/api/auth/profile');
          
          if (response.data.success && response.data.user) {
            console.log('✅ Token verified, user loaded:', response.data.user.username);
            setUser(response.data.user);
          } else {
            console.log('❌ Invalid response format, clearing auth');
            clearAuth();
          }
        } catch (error) {
          console.log('❌ Token verification failed:', error.response?.data?.message || error.message);
          clearAuth();
        }
      }
      
      setLoading(false);
      console.log('✅ Auth initialization complete');
    };

    initAuth();
  }, []); // Remove token dependency to avoid infinite loop

  const clearAuth = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      const response = await axios.post('/api/auth/login', { 
        email: email.trim(), 
        password 
      });

      console.log('Login response:', response.data);

      if (response.data.success && response.data.token && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        
        console.log('✅ Login successful for user:', userData.username);
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true };
      } else {
        console.log('❌ Invalid login response format');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      
      const message = error.response?.data?.message || 
                     error.message || 
                     'Login failed. Please try again.';
      
      return {
        success: false,
        message
      };
    }
  };

  const register = async (email, password) => {
    console.log('📝 Attempting registration for:', email);
    
    try {
      const response = await axios.post('/api/auth/register', { 
        email: email.trim(), 
        password 
      });

      console.log('Registration response:', response.data);

      if (response.data.success && response.data.token && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        
        console.log('✅ Registration successful for user:', userData.username);
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true };
      } else {
        console.log('❌ Invalid registration response format');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      
      const message = error.response?.data?.message || 
                     error.message || 
                     'Registration failed. Please try again.';
      
      return {
        success: false,
        message
      };
    }
  };

  const logout = () => {
    console.log('👋 Logging out user:', user?.username);
    clearAuth();
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};