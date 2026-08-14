//src/routes/adminRoute.ts

import { Router } from "express";

import {
  getAdminDashboard,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  getCampaignPage,
} from "../controllers/adminController";

import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router = Router();

// ============================================================
// ADMIN PROTECTION
// ============================================================

router.use(authenticateToken);
router.use(requireAdmin);


// ============================================================
// ADMIN DASHBOARD
// ============================================================

router.get("/", getAdminDashboard);


// ============================================================
// ADD PRODUCT
// ============================================================

router.get("/add-product", getAddProduct);
router.post("/add-product", postAddProduct);


// ============================================================
// EDIT PRODUCT
// ============================================================

router.get("/edit-product/:id", getEditProduct);
router.post("/edit-product/:id", postEditProduct);


// ============================================================
// DELETE PRODUCT
// ============================================================

router.post("/delete-product/:id", deleteProduct);


// ============================================================
// CAMPAIGN
// ============================================================

router.get("/campaign", getCampaignPage);


export default router;