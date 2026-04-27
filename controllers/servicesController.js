import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Service from "../models/servicesModel.js";

// @desc   Create a new service
// @route  POST /api/v1/services
// @access Private (Business owners only)
export const createService = asyncHandler(async (req, res, next) => {
  const service = await Service.create(req.body);
  res.status(201).json({ data: service });
});

// @desc   Get all services
// @route  GET /api/v1/services
// @access Public
export const getAllServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find();
  if (services.length === 0) {
    return next(new ApiError("No services found", 404));
  }
  res.status(200).json({ data: services });
});

// @desc   Get a service by ID
// @route  GET /api/v1/services/:id
// @access Public
export const getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new ApiError("Service not found", 404));
  }
  res.status(200).json({ data: service });
});

// @desc   Get services by business ID
// @route  GET /api/v1/services/business/:businessId
// @access Public
export const getServicesByBusiness = asyncHandler(async (req, res, next) => {
  const services = await Service.find({ business: req.params.businessId });
  if (services.length === 0) {
    return next(new ApiError("No services found for this business", 404));
  }
  res.status(200).json({ data: services });
});

// @desc   Update specific service
// @route  PUT /api/v1/services/:id
// @access Private (Business owners only)
export const updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!service) {
    return next(new ApiError("Service not found", 404));
  }
  res.status(200).json({ data: service });
});

// @desc   Delete specific service
// @route  DELETE /api/v1/services/:id
// @access Private (Business owners only)
export const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    return next(new ApiError("Service not found", 404));
  }
  res.status(204).send();
});
