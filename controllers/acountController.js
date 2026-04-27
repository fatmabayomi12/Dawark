import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import Account from "../models/accountModel.js";
import { createToken } from "../utils/createToken.js";

// @desc   Signup a new user
// @route  POST /api/v1/accounts/signup
// @access Public
export const signup = asyncHandler(async (req, res, next) => {
  const { phone, password, role, fullName, businessName, category, address } =
    req.body;
  if (!role) {
    return next(new ApiError("Role is required", 400));
  }
  // Check if phone already exists
  const existing = await Account.findOne({ phone });
  if (existing) {
    return next(new ApiError("Phone number already exists", 400));
  }

  const account = await Account.create({
    fullName: role === "user" ? fullName : undefined,
    businessName: role === "business" ? businessName : undefined,
    phone,
    address,
    password: await bcrypt.hash(password, 12),
    role,
    category: role === "business" ? category : undefined,
  });
  account.password = undefined;

  const token = createToken(account._id);
  res.status(201).json({ data: account, token });
});

// @desc   Login user
// @route  POST /api/v1/accounts/login
// @access Public
export const login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;
  const account = await Account.findOne({ phone });
  if (!account || !(await bcrypt.compare(password, account.password))) {
    return next(new ApiError("Invalid phone number or password", 401));
  }
  account.password = undefined;
  const token = createToken(account._id);
  res.status(200).json({ data: account, token });
});

// Make Sure the user is authenticated before accessing protected routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("You are not logged in. Please log in to get access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await Account.findById(decoded.id);

  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token does not exist.", 401)
    );
  }

  req.user = currentUser;
  next();
});