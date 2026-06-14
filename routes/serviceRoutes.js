import express from "express";

import { protect } from "../controllers/authController.js";

import {
  setupBusiness,
  addService,
  getServices,
  getServiceById,
  deleteService,
  addProvider,
  deleteProvider,
  finishSetup,
  getProfile,
} from "../controllers/servicesController.js";

const serviceRouter = express.Router();

serviceRouter.use(protect);

serviceRouter.post("/business-info", setupBusiness);

serviceRouter.route("/").post(addService).get(getServices);

serviceRouter.post("/finish", finishSetup);

serviceRouter.get("/profile", getProfile);

serviceRouter.post("/providers", addProvider);

serviceRouter.route("/:id").get(getServiceById).delete(deleteService);

serviceRouter.delete("/providers/:id", deleteProvider);

export default serviceRouter;
