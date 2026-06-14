import authRoutes from "./authRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import workingHoursRoutes from "./workingHoursRoutes.js";
import bookingRoutes from "./bookingRoutes.js";

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/services", serviceRoutes);
  app.use("/api/v1/working-hours", workingHoursRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
};

export default mountRoutes;
