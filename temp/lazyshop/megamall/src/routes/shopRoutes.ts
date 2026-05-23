// src/routes/shopRoutes.ts
import express from "express";
import { 
  getProducts, 
  getProductDetail, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsJSON,
  getProduct
} from "../controllers/productController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router = express.Router();

// =====================
// FRONTEND PAGES
// =====================
router.get("/", getProducts);
router.get("/product/:id", getProductDetail);

// =====================
// ADMIN PAGE
// =====================
router.get("/admin",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.render("admin");
  }
);

// =====================
// API ROUTES (CLEAN)
// =====================
router.get("/api/products", getProductsJSON);
router.get("/api/products/:id", getProduct); // 🔥 REQUIRED

router.post("/api/products", createProduct);
router.put("/api/products/:id", updateProduct);
router.delete("/api/products/:id", deleteProduct);

export default router;