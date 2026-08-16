import express from "express";
import path from "path";
import { env } from "./config/env";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoute";
import { refreshAccessToken } from "./controllers/userController";
import { renderCartPage } from "./controllers/cartController";
import { stripeWebhook } from "./controllers/stripeController";
import stripeRoutes from "./routes/stripeRoute";
import shopRoutes from "./routes/shopRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import recentViewRoutes from "./routes/recentViewRoutes";
import orderRoutes from "./routes/orderRoutes";
import addressRoutes from "./routes/addressRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { authenticateToken } from "./middlewares/authMiddleware";
import paystackRoute from "./routes/paystackRoute";
import { sameOriginProtection } from "./middlewares/security";
import mongoose from "mongoose";
import { Settings } from "./models/Settings";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Basic security headers without adding another runtime dependency.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );
  next();
});

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Stripe requires the raw request body for signature verification.
// This route MUST be registered before express.json().
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  stripeWebhook
);

// Body parsers with explicit limits.
app.use(express.json({
  limit: "1mb",
  verify: (req: any, _res, buf) => {
    if (req.originalUrl === "/api/paystack/webhook") {
      req.rawBody = Buffer.from(buf);
    }
  },
}));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

app.use(sameOriginProtection);

// Refresh token
app.post("/api/refresh-token", refreshAccessToken);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/paystack", paystackRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/recent", recentViewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api", settingsRoutes);
app.use("/api/upload", uploadRoutes);

// Frontend routes
app.use("/", shopRoutes);

app.get(
  "/dashboard",
  authenticateToken,
  async (_req, res) => {
    const settings = await Settings.findOne().lean() || new Settings({ siteName: env.siteName, currencyCode: env.storeCurrency, currencySymbol: env.storeCurrencySymbol }).toObject();
    res.render("dashboard", { settings });
  }
);

app.get("/cart", renderCartPage);

// Password reset page
app.get("/reset-password/:token", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/reset-password.html"));
});

// Static files
app.use(
  express.static(path.join(__dirname, "..", "public"), {
    maxAge: env.nodeEnv === "production" ? "7d" : 0,
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(database === "connected" ? 200 : 503).json({
    status: database === "connected" ? "ok" : "degraded",
    database,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/ready", (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ ready: false });
  return res.json({ ready: true });
});

// JSON 404 for API requests
app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Generic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled request error:", err);

  if (res.headersSent) {
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

export default app;
