//src/routes/productsRoute.ts
import { Router } from "express";
import { getProducts, getProductDetails } from "../controllers/productController";

const router = Router();

// GET all products
router.get("/", getProducts);

// GET single product by slug
router.get("/:slug", getProductDetails);

export default router;
