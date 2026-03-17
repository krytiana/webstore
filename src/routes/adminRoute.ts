import { Router, Request, Response, NextFunction } from "express";
import { 
  getAdminDashboard, 
  getAddProduct, 
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct
} from "../controllers/adminController";

const router = Router();



// Admin dashboard
router.get("/", getAdminDashboard);

// Add product
router.get("/add-product", getAddProduct);
router.post("/add-product", postAddProduct);

// Edit product
router.get("/edit-product/:id", getEditProduct);
router.post("/edit-product/:id", postEditProduct);

// Delete product
router.post("/delete-product/:id", deleteProduct);

export default router;
