import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

import pageRoutes from "./routes/pagesRoute";
import productRoutes from "./routes/productsRoute";
import pricingRoutes from "./routes/pricingRoute";
import adminRoutes from "./routes/adminRoute";

import Product from "./models/ProductModel";



dotenv.config();

const app: Application = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

// Routes
app.use("/", pageRoutes);
app.use("/products", productRoutes); 
app.use("/pricing", pricingRoutes);
app.use("/admin", adminRoutes);


connectDB();

const testProduct = async () => {
  const count = await Product.countDocuments();
  console.log("Product count:", count);
};

testProduct();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
