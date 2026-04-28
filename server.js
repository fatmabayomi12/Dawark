// import express from "express";
// import dotenv from "dotenv";
// import { dbConnection } from "./config/database.js";
// import accountRoutes from "./routes/accountRoutes.js";
// import categoryRouter from "./routes/categoryRoutes.js";
// import serviceRouter from "./routes/serviceRoutes.js";
// import weekDayRouter from "./routes/weekDayRoutes.js";
// import { globalError } from "./middelware/errorMiddelware.js";

// dotenv.config({ path: "./config.env" });
// // Database Connection
// dbConnection();
// // Express App
// const app = express();
// // Middleware to parse JSON bodies
// app.use(express.json());

// app.use("/api/v1/accounts", accountRoutes);
// app.use("/api/v1/categories", categoryRouter);
// app.use("/api/v1/services", serviceRouter);
// app.use("/api/v1/weekDays", weekDayRouter);

// // Global Error Handling Middleware for express
// app.use(globalError);
// // Port
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "./config/database.js";
import accountRoutes from "./routes/accountRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";
import weekDayRouter from "./routes/weekDayRoutes.js";
import { globalError } from "./middelware/errorMiddelware.js";

dotenv.config({ path: "./config.env" });

// DB
dbConnection();

const app = express();

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Dawark API is running 🚀");
});

// routes
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/weekDays", weekDayRouter);

// error handling
app.use(globalError);

export default app;
