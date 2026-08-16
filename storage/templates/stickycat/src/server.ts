import { env, validateEnvironment } from "./config/env";
import { connectDB } from "./config/mongo";
import app from "./app";
import { createAdminIfNotExists } from "./utils/createAdmin";
import mongoose from "mongoose";
async function start() {
  validateEnvironment();
  await connectDB();
  await createAdminIfNotExists();
  const server = app.listen(env.port, () => console.log(`${env.siteName} listening on port ${env.port}`));
  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => { await mongoose.connection.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM")); process.on("SIGINT", () => shutdown("SIGINT"));
}
start().catch((err) => { console.error("Failed to start application:", err); process.exit(1); });
