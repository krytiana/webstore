// src/routes/paystackRoute.ts

import express from "express";

import {
  createPaystackCheckout,
  verifyPaystackPayment,
  paystackWebhook
} from "../controllers/paystackController";

import { authenticateToken } from "../middlewares/authMiddleware";
import { rateLimit } from "../middlewares/rateLimit";

const router = express.Router();

// ---------------------------------------------
// Create Paystack checkout
// ---------------------------------------------

router.post(
  "/cart-checkout",
  rateLimit(10 * 60 * 1000, 10),
  authenticateToken,
  createPaystackCheckout
);

// ---------------------------------------------
// Paystack callback / verification
// ---------------------------------------------

router.get(
  "/callback",
  verifyPaystackPayment
);

// ---------------------------------------------
// Paystack webhook
// ---------------------------------------------

router.post(
  "/webhook",
  paystackWebhook
);

export default router;