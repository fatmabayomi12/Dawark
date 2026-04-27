import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";

const accountSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [5, "Password must be at least 5 characters long"],
    },
    address: String,

    role: {
      type: String,
      enum: ["user", "business", "admin"],
      required: true,
    },

    fullName: {
      type: String,
      minLength: [3, "Full name must be at least 3 characters long"],
      maxLength: [50, "Full name must be less than 50 characters long"],
    },

    businessName: {
      type: String,
      minLength: [3, "Business name must be at least 3 characters long"],
      maxLength: [100, "Business name must be less than 100 characters long"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true },
);

accountSchema.pre("save", async function () {
  if (this.role === "user" && !this.fullName) {
    return next(new ApiError("Full name is required for users", 400));
  }
  if (this.role === "business" && !this.businessName) {
    return next(new ApiError("Business name is required for businesses", 400));
  }
});

accountSchema.pre("save", async function () {
  await this.populate({ path: "category", select: "name _id" });
});

const Account = mongoose.model("Account", accountSchema);

export default Account;
