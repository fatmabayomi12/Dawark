import { check } from "express-validator";
import { validatorMiddelware } from "../../middelware/validatorMiddelware.js";

export const signupValidator = [
  // Check user validation
  check("fullName")
    .if(check("role").equals("user"))
    .notEmpty()
    .withMessage("Full name is required for users")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters"),
  
  // Check business validation
  check("businessName")
    .if(check("role").equals("business"))
    .notEmpty()
    .withMessage("Business name is required for businesses")
    .isLength({ min: 3, max: 100 })
    .withMessage("Business name must be between 3 and 100 characters"),
  
  check("category")
    .if(check("role").equals("business"))
    .notEmpty()
    .withMessage("Category is required for businesses")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  
    
    check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid phone number format"),
    
    check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),
    
    check("address").optional(),
    
    check("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["user", "business"])
      .withMessage("Role must be either 'user' or 'business'"),
  validatorMiddelware,
];

export const loginValidator = [
  check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid phone number format"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),
  validatorMiddelware,
];
