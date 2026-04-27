import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  createCategoryValidator,
  getCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
} from "../utils/validator/categoryValidator.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .post(createCategoryValidator, createCategory)
  .get(getCategories);

categoryRouter
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

export default categoryRouter;
