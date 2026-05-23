// src/routes/orderRoutes.ts
import express from "express";

import {
  getUserOrders,
  getOrderTracking,
  updateOrderStatus,
  getOrderById,
  getAllOrders
} from "../controllers/orderController";

import {
  authenticateToken
} from "../middlewares/authMiddleware";

import { requireAdmin }
 from "../middlewares/adminMiddleware";

const router = express.Router();


router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  getAllOrders
);

// ---------------- USER ORDERS ----------------
router.get(
  "/",
  authenticateToken,
  getUserOrders
);

// ---------------- TRACK ORDER ----------------
router.get(
  "/:orderId/tracking",
  authenticateToken,
  getOrderTracking
);

// ---------------- ADMIN UPDATE STATUS ----------------
router.put(
  "/:orderId/status",
  authenticateToken,
  // requireAdmin,
  updateOrderStatus
);

// get order by ID (for order detail page)
router.get("/:id", authenticateToken, getOrderById);

export default router;