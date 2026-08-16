import express from "express";
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsJSON,
  getProduct,
  renderCategoryPage,
} from "../controllers/productController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";
import { Settings } from "../models/Settings";

const router = express.Router();

// Frontend pages
router.get("/", getProducts);
router.get("/category/:category", renderCategoryPage);
router.get("/product/:id", getProductDetail);

// Admin page
router.get(
  "/admin",
  authenticateToken,
  requireAdmin,
  async (_req, res) => { const settings = await Settings.findOne().lean() || new Settings().toObject(); res.render("admin", { settings }); }
);

// Public product API
router.get("/api/products", getProductsJSON);
router.get("/api/products/:id", getProduct);

// Admin product mutations
router.post(
  "/api/products",
  authenticateToken,
  requireAdmin,
  createProduct
);

router.put(
  "/api/products/:id",
  authenticateToken,
  requireAdmin,
  updateProduct
);

router.delete(
  "/api/products/:id",
  authenticateToken,
  requireAdmin,
  deleteProduct
);

export default router;
