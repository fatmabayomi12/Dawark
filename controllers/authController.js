// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import asyncHandler from "express-async-handler"
import { createHash } from "crypto";
import User from '../models/userModel.js';
import Business from '../models/businessModel.js';
import Service from '../models/serviceModel.js';
import ServiceProvider from '../models/serviceProviderModel.js';
import OwnerProfile from '../models/ownerProfileModel.js';
import ApiError from "../utils/apiError.js"
import { resetPasswordTemplate } from "../utils/emailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";


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

// @desc   Edit Account (phone, email, password)
// @route  PATCH /api/v1/settings/account
// @access Private
export const editAccount = async (req, res) => {
  try {
    const { phone_number, email, current_password, new_password } = req.body;

    const user = await User.findById(req.user._id);

    if (phone_number) user.phone_number = phone_number;
    if (email) user.email = email;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: "Current password is required" });
      }
      const isMatch = await user.comparePassword(current_password);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      user.password = new_password;
    }

    await user.save();

    res.status(200).json({ message: "Account updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Edit Business Info
// @route  PATCH /api/v1/settings/business
// @access Private (Owner)
export const editBusinessInfo = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can access this" });
    }

    const { business_name, address } = req.body;

    const profile = await OwnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (business_name) profile.business_name = business_name;
    if (address) profile.address = address;

    await profile.save();

    res.status(200).json({ message: "Business info updated", profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Edit Service
// @route  PATCH /api/v1/settings/services/:id
// @access Private (Owner)
export const editService = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can access this" });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const { name, duration_minutes, price } = req.body;

    if (name) service.name = name;
    if (duration_minutes) service.duration_minutes = duration_minutes;
    if (price) service.price = price;

    await service.save();

    res.status(200).json({ message: "Service updated", service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Edit Provider
// @route  PATCH /api/v1/settings/providers/:id
// @access Private (Owner)
export const editProvider = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can access this" });
    }

    const provider = await ServiceProvider.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const { name, title, services } = req.body;

    if (name) provider.name = name;
    if (title) provider.title = title;
    if (services) provider.services = services;

    await provider.save();

    res.status(200).json({ message: "Provider updated", provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Forget password
// @route  POST /api/v1/auth/forget-password
// @access Public
export const forgetPassword = asyncHandler(async (req, res, next) => {
  console.log("forgetPassword route called");
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = createHash("sha256").update(resetCode).digest("hex");
  user.passwordResetCode = hashedCode;
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();
  const message = resetPasswordTemplate(user.email, resetCode);
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 minutes)",
      message,
    });
  } catch (err) {
    console.log("Email sending error:", err);
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("There was an error sending the email", 500));
  }
  res.status(200).json({
    status: "success",
    message: "Reset code sent to email, please check your inbox",
  });
});

// @desc   Verify reset code
// @route  POST /api/v1/auth/verify-reset-code
// @access Public
export const verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedCode = createHash("sha256").update(req.body.resetCode).digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedCode,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Invalid or expired reset code", 400));
  }
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Reset code verified, you can now reset your password",
  });
});

// @desc   Reset password
// @route  POST /api/v1/auth/reset-password
// @access Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({email});
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
    message:
      "Password reset successful, you can now log in with your new password",
  });
});