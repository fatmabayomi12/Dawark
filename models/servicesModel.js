import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Service name must be at least 3 characters long"],
      maxLength: [100, "Service name must be less than 100 characters long"],
    },
    description: {
      type: String,
      minLength: [
        10,
        "Service description must be at least 10 characters long",
      ],
      maxLength: [
        200,
        "Service description must be less than 200 characters long",
      ],
    },
    photo: String,
    // duration_time: {
    //   type: Number,
    //   required: true,
    //   min: [1, "Duration time must be at least 1 minute"],
    // },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { timestamps: true },
);

servicesSchema.pre("save", function () {
  this.populate({
    path: "business",
    select: "businessName category",
    populate: { path: "category", select: "name" },
  });
});

servicesSchema.pre(/^find/, function () {
  this.populate({
    path: "business",
    select: "businessName category",
    populate: { path: "category", select: "name" },
  });
});
const Services = mongoose.model("Services", servicesSchema);

export default Services;
