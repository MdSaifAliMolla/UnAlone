const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateRandomUsername, assignDefaultAvatar } = require('../utils/profileGenerator');

exports.register = async (req, res) => {
  console.log('🔐 Registration attempt:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate random profile
    const randomUsername = generateRandomUsername();
    const defaultAvatarUrl = assignDefaultAvatar();

    console.log('👤 Generated profile:', { username: randomUsername, avatarUrl: defaultAvatarUrl });

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username: randomUsername,
      avatarUrl: defaultAvatarUrl,
    });

    console.log('✅ User created successfully:', newUser.id);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userData = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt
    };

    console.log('✅ Registration successful');
    res.status(201).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  console.log('🔐 Login attempt:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    console.log('✅ Login successful:', user.id);
    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log('👤 Profile request for user:', req.user.id);
    
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'username', 'avatarUrl', 'createdAt']
    });

    if (!user) {
      console.log('❌ User not found in profile request');
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('✅ Profile retrieved successfully');
    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('💥 Get profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};