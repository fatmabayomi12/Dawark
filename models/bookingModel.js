import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    service_provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    date: {
      type: String, // "2026-05-30"
      required: true,
    },
    start_time: {
      type: String, // "09:00"
      required: true,
    },
    end_time: {
      type: String, // "09:30"
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "present", "completed", "cancelled", "missed"],
      default: "waiting",
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
