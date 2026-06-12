import authRoutes from "./authRoutes.js";
import serviceRoutes from "./serviceRoutes.js";





const mountRoutes = (app) =>{
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/services", serviceRoutes);

} 

export default mountRoutes;