// routes/auth.routes.js
import express from "express";

import {
  protect,
  register,
  chooseRole,
  getBusinesses,
  chooseBusiness,
  login,
  editAccount,
  editBusinessInfo,
  editService,
  editProvider,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/choose-role", protect, chooseRole);
authRouter.get("/businesses", getBusinesses);
authRouter.post("/choose-business", protect, chooseBusiness);
authRouter.post("/login", login);
authRouter.patch("/account", protect, editAccount);
authRouter.patch("/business", protect, editBusinessInfo);
authRouter.post("/forgetPassword", forgetPassword);
authRouter.post("/verifyResetCode", verifyResetCode);
authRouter.post("/resetPassword", resetPassword);
authRouter.patch("/services/:id", protect, editService);
authRouter.patch("/providers/:id", protect, editProvider);

export default authRouter;
