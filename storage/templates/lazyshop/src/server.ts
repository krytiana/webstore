// src/server.ts
import dotenv from "dotenv";
import { connectDB } from "./config/mongo";
import app from "./app";
import { createAdminIfNotExists } from "./utils/createAdmin";


dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => {
    // Create admin user if not exists
    return createAdminIfNotExists();
  })
  .then(() => {
    // Start server after DB connection and admin creation
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });