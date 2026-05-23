// src/app.ts
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoute";
import { refreshAccessToken } from "./controllers/userController";
import { renderCartPage } from "./controllers/cartController";
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


dotenv.config();

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Refresh token
app.post("/api/refresh-token", refreshAccessToken);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/recent", recentViewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);

// Frontend routes
app.use("/", shopRoutes);

app.use("/api", settingsRoutes);
app.use("/api/upload", uploadRoutes);
// Pages
app.get("/dashboard",
  authenticateToken,
  (req, res) => {
    res.render("dashboard");
  }
);


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/cart", renderCartPage);

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

export default app;