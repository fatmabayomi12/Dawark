import asyncHandler from "express-async-handler"
import WeekDays from "../models/weekDaysModel.js"
import ApiError from "../utils/ApiError.js";

// @desc   Create or update business schedule
// @route  POST /api/v1/weekdays
// @access Private (Business owners only)
export const createSchedule = asyncHandler(async (req, res, next) => {
  const shecduleData = await WeekDays.create({
    business: req.user._id,
    schedule: req.body.schedule,
  });
  res.status(201).json({ data: shecduleData });
});

// @desc   Get business schedule
// @route  GET /api/v1/weekdays/business/:businessId
// @access Public
export const getScheduleByBusiness = asyncHandler(async (req, res, next) => {
  const schedule = await WeekDays.findOne({ business: req.params.businessId });
  if (!schedule) {
    return next(new ApiError("Schedule not found for this business", 404));
  }
  res.status(200).json({ data: schedule });
});

// @desc   Update business schedule
// @route  PUT /api/v1/weekdays/:id
// @access Private (Business owners only)
export const updateSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await WeekDays.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!schedule) {
    return next(new ApiError("Schedule not found", 404));
  }
  res.status(200).json({ data: schedule });
});

// @desc   Delete business schedule
// @route  DELETE /api/v1/weekdays/:id
// @access Private (Business owners only)
export const deleteSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await WeekDays.findByIdAndDelete(req.params.id);
  if (!schedule) {
    return next(new ApiError("Schedule not found", 404));
  }
  res.status(200).send();
});
