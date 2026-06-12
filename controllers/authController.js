// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Business from '../models/businessModel.js';
import OwnerProfile from '../models/ownerProfileModel.js';

// Make Sure the user is authenticated before accessing protected routes
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
// Generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME || '30d'
  });
};

// @desc   Signup a new user
// @route  POST /api/v1/accounts/signup
// @access Public
export const register = async (req, res) => {
  try {
    const { phone_number, email, password, confirm_password } = req.body;

    // Validation
    if (!phone_number || !email || !password || !confirm_password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check duplicates
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const phoneExists = await User.findOne({ phone_number });
    if (phoneExists) {
      return res.status(409).json({ error: 'Phone number already exists' });
    }

    const user = await User.create({ phone_number, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user,
      next_step: 'choose_role'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Set user role
// @route  POST /api/v1/accounts/choose-role
// @access Public
export const chooseRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['owner', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be owner or user' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role, registration_step: 'role_chosen' },
      { new: true }
    );

    res.status(200).json({
      message: `Role set to ${role}`,
      user,
      next_step: 'choose_business'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get all businesses
// @route  GET /api/v1/accounts/businesses
// @access Public
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ is_active: true });
    res.status(200).json({ businesses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Set user business
// @route  POST /api/v1/accounts/choose-business
// @access Public
export const chooseBusiness = async (req, res) => {
  try {
    const { business_id } = req.body;

    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(400).json({ error: 'Invalid business' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        business: business_id,
        registration_step: req.user.role === 'user' ? 'completed' : 'business_chosen'
      },
      { new: true }
    ).populate('business');

    // لو user عادي → خلاص
    if (user.role === 'user') {
      return res.status(200).json({
        message: 'Registration complete',
        user,
        next_step: 'done'
      });
    }

    // لو owner → يكمل
    res.status(200).json({
      message: 'Business selected',
      user,
      next_step: 'owner_details'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Login user
// @route  POST /api/v1/accounts/login
// @access Public
export const login = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const user = await User.findOne({ phone_number }).populate('business');

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    let profile = null;
    if (user.role === 'owner') {
      profile = await OwnerProfile.findOne({ user: user._id })
        .populate('services')
        .populate('service_providers');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
      profile: profile || null,
      next_step: user.registration_step !== 'completed' ? user.registration_step : 'home'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


