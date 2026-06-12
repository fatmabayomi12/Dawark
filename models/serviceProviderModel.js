import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
  },
  { timestamps: true },
);

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema,
);

export default ServiceProvider;
