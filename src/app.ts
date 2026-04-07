import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db";

import pageRoutes from "./routes/pagesRoute";
import productRoutes from "./routes/productsRoute";
import pricingRoutes from "./routes/pricingRoute";
import adminRoutes from "./routes/adminRoute";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoute";
import { refreshToken } from "./middlewares/authMiddleware";
import stripeRoute from "./routes/stripeRoute";

import Product from "./models/ProductModel";

const app: Application = express();

// ------------------------
// 🚨 STRIPE ROUTES FIRST
// ------------------------
app.use("/api/payments", stripeRoute);

// ------------------------
// Middleware
// ------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ------------------------
// Other routes
// ------------------------
app.post("/api/refresh-token", refreshToken);

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/", pageRoutes);
app.use("/products", productRoutes);
app.use("/pricing", pricingRoutes);
app.use("/admin", adminRoutes);

// ------------------------
// Connect DB
// ------------------------
connectDB();

// ------------------------
// Test DB
// ------------------------
const testProduct = async () => {
  const count = await Product.countDocuments();
  console.log("Product count:", count);
};
testProduct();

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});