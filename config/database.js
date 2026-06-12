// config/database.js
import mongoose from "mongoose";

export const dbConnection = () => {
  return mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`Database Connected: ${conn.connection.host}`);
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
};

