import { check } from "express-validator";
import { validatorMiddelware } from "../../middelware/validatorMiddelware.js";
import slugify from "slugify";


export const createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("photo_url").optional(),
  validatorMiddelware,
];

export const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID"),
  validatorMiddelware,
];

export const updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID"),
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("photo_url").optional(),
  validatorMiddelware,
];

export const deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID"),
  validatorMiddelware,
];
