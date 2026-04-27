import express from "express";

import {
  createServiceValidator,
  getServiceValidator,
  updateServiceValidator,
  deleteServiceValidator,
} from "../utils/validator/serviceValidator.js";

import {
  createService,
  getAllServices,
  getService,
  getServicesByBusiness,
  updateService,
  deleteService,
} from "../controllers/servicesController.js";

const serviceRouter = express.Router();

serviceRouter
  .route("/")
  .post(createServiceValidator, createService)
  .get(getAllServices);

serviceRouter
  .route("/business/:businessId")
  .get(getServicesByBusiness);

serviceRouter
  .route("/:id")
  .get(getServiceValidator, getService)
  .put(updateServiceValidator, updateService)
  .delete(deleteServiceValidator, deleteService);

export default serviceRouter;
