import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "./config/database.js";
import mountRoutes from "./routes/index.js";
import { globalError } from "./middelware/errorMiddelware.js";
import seedBusinesses from "./seeds/business.seed.js";

dotenv.config({ path: "./config.env" });

// DB Connection
dbConnection().then(async () => {
  await seedBusinesses();
});

const app = express();
app.use(express.json());
mountRoutes(app);
app.use(globalError);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});