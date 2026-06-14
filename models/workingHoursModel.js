import mongoose from "mongoose";

const dayScheduleSchema = new mongoose.Schema(
  {
    is_open: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String, // "09:00"
      default: "09:00",
    },
    to: {
      type: String, // "17:00"
      default: "17:00",
    },
  },
  { _id: false },
);

const workingHoursSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    schedule: {
      saturday: { type: dayScheduleSchema, default: () => ({}) },
      sunday: { type: dayScheduleSchema, default: () => ({}) },
      monday: { type: dayScheduleSchema, default: () => ({}) },
      tuesday: { type: dayScheduleSchema, default: () => ({}) },
      wednesday: { type: dayScheduleSchema, default: () => ({}) },
      thursday: { type: dayScheduleSchema, default: () => ({}) },
      friday: { type: dayScheduleSchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

const WorkingHours = mongoose.model("WorkingHours", workingHoursSchema);

export default WorkingHours;
