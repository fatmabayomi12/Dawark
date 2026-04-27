import express, { Router } from "express";

import {
  createSchedule,
  getScheduleByBusiness,
  updateSchedule,
  deleteSchedule,
} from "../controllers/weekDaysController.js";

import { protect } from "../controllers/acountController.js";

const weekDayRouter = express.Router();

weekDayRouter.route("/").post(protect, createSchedule);

weekDayRouter.route("/:businessId").get(getScheduleByBusiness);

weekDayRouter.route("/:id").put(updateSchedule).delete(deleteSchedule);

export default weekDayRouter;
