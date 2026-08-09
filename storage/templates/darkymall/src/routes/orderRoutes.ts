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


// Customer + Admin
router.get("/", authenticateToken, getUserOrders);

router.get("/:id", authenticateToken, getOrderById);

router.get("/:orderId/tracking", authenticateToken, getOrderTracking);


// Admin only
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  getAllOrders
);

router.put(
  "/:orderId/status",
  authenticateToken,
  requireAdmin,
  updateOrderStatus
);

export default router;