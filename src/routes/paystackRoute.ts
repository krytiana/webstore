// src/routes/paystackRoute.ts

import express from "express";

import {
  createCartCheckoutSession,
  paystackWebhook,
  paystackCallback,
} from "../controllers/paystackController";

import { authenticateToken } from "../middlewares/authMiddleware";


const router = express.Router();


// ============================================================
// 💳 PAYSTACK CHECKOUT
// Protected — user must be logged in
// ============================================================

router.post(
  "/cart-checkout",
  authenticateToken,
  express.json(),
  createCartCheckoutSession
);


// ============================================================
// 🔄 PAYSTACK CALLBACK
// Customer returns here after payment
// ============================================================

router.get(
  "/callback",
  paystackCallback
);


// ============================================================
// 🚨 PAYSTACK WEBHOOK
// NO AUTHENTICATION
//
// IMPORTANT:
// Must receive the raw body for Paystack signature verification.
// ============================================================

router.post(
  "/webhook",
  express.raw({
    type: "application/json",
  }),
  paystackWebhook
);


export default router;