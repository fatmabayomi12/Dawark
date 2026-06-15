import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getSchedule,
  markPresent,
  markCompleted,
} from "../controllers/scheduleController.js";

const scheduleRouter = express.Router();

scheduleRouter.use(protect);

scheduleRouter.get("/", getSchedule);
scheduleRouter.patch("/:id/present", markPresent);
scheduleRouter.patch("/:id/complete", markCompleted);

export default scheduleRouter;
