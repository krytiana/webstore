// src/app.ts
import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config();


import connectDB from "./config/db";

import session from "express-session";


import cookieParser from "cookie-parser";
import pageRoutes from "./routes/pagesRoute";
import productRoutes from "./routes/productsRoute";
import pricingRoutes from "./routes/pricingRoute";
import adminRoutes from "./routes/adminRoute";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoute";
import { refreshToken } from "./middlewares/authMiddleware";
import stripeRoute from "./routes/stripeRoute";
import downloadRoute from "./routes/downloadRoute";
import dashboardRoutes from "./routes/dashboardRoute";
import deployRoute from "./routes/deployRoute";
import githubRoute from "./routes/githubRoute";
import deployGuideRoute from "./routes/deployGuideRoute";


import Product from "./models/ProductModel";
import path from "path";

const app: Application = express();
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
    }

  })
);

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
app.use(cookieParser());

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
app.use("/downloads", downloadRoute);
app.use("/dashboard", dashboardRoutes);
app.use("/deploy", deployRoute);
app.use(githubRoute);
app.use(deployGuideRoute);
app.get("/reset-password/:token", (req, res) => {
    const token = req.params.token;

    res.render("reset-password", { token });
});

// Handle 404 errors (keep this last)
app.use((req, res) => {
    res.status(404).send("Page not found");
});
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