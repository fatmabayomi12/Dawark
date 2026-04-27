import { check } from "express-validator";
import { validatorMiddelware } from "../../middelware/validatorMiddelware.js";

export const createServiceValidator = [
  check("name")
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ min: 3 })
    .withMessage("Service name must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("Service name must be less than 100 characters long"),
  check("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Service description must be at least 10 characters long")
    .isLength({ max: 200 })
    .withMessage("Service description must be less than 200 characters long"),
  check("photo").optional(),
  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  check("business")
    .notEmpty()
    .withMessage("Business ID is required")
    .isMongoId()
    .withMessage("Invalid Business ID format"),
  validatorMiddelware,
];

export const getServiceValidator = [
  check("id").isMongoId().withMessage("Invalid service ID format"),
  validatorMiddelware,
];

export const updateServiceValidator = [
  check("id").isMongoId().withMessage("Invalid service ID format"),
  validatorMiddelware,
];

export const deleteServiceValidator = [
  check("id").isMongoId().withMessage("Invalid service ID format"),
  validatorMiddelware,
];
