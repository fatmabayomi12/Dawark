// routes/auth.routes.js
import express from "express";

import {
  protect,
  register,
  chooseRole,
  getBusinesses,
  chooseBusiness,
  login
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/choose-role", protect, chooseRole);
authRouter.get("/businesses", getBusinesses);
authRouter.post("/choose-business", protect, chooseBusiness);
authRouter.post("/login", login);
export default authRouter;
