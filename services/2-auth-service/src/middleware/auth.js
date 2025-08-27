const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - checking token...');
    
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('❌ No Authorization header provided');
      return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token found after Bearer');
      return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    // Verify JWT secret exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    // Verify token
    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token decoded, user ID:', decoded.id);

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log('❌ User not found for decoded ID:', decoded.id);
      return res.status(401).json({ message: 'Token is not valid.' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl
    };
    
    console.log('✅ Auth successful for user:', user.username);
    next();

  } catch (error) {
    console.error('💥 Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    res.status(401).json({ message: 'Token verification failed.' });
  }
};

module.exports = auth;