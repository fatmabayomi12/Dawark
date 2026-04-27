import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Category from "../models/categoryModel.js";

// @desc   Create a new category
// @route  POST /api/v1/categories
// @access Private (admin)
export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ data: category });
});

// @desc   Get all categories
// @route  GET /api/v1/categories
// @access Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  if (!categories) {
    return next(new ApiError("No categories found", 404));
  }
  res.status(200).json({ data: categories });
});

// @desc   Get a category by ID
// @route  GET /api/v1/categories/:id
// @access Public
export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).json({ data: category });
});

// @desc   Update specific category
// @route  PUT /api/v1/categories/:id
// @access Private (admin)
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).json({ data: category });
});

// @desc   Delete specific category
// @route  DELETE /api/v1/categories/:id
// @access Private (admin)
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(204).send();
});
