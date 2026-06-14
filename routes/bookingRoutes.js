import express from "express";
import { protect } from "../controllers/authController.js";
import {
  getOwners,
  getOwnerServices,
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.use(protect);

bookingRouter.get("/owners", getOwners);
bookingRouter.get("/owners/:ownerId/services", getOwnerServices);
bookingRouter.get("/owners/:ownerId/slots", getAvailableSlots);
bookingRouter.post("/", createBooking);
bookingRouter.get("/my", getMyBookings);
bookingRouter.patch("/:id/cancel", cancelBooking);

export default bookingRouter;
