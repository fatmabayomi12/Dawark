import express from "express";

import { signup, login } from "../controllers/acountController.js";
import {
  signupValidator,
  loginValidator,
} from "../utils/validator/accountValidator.js";

const accountRoutes = express.Router();

// User routes
accountRoutes.post("/signup", signupValidator, signup);
accountRoutes.post("/login", loginValidator, login);

// Business routes
// accountRoutes.post("/businesses/signup", businessSignupValidator, businessSignup);
// accountRoutes.post("/businesses/login", loginValidator, login);

export default accountRoutes;
