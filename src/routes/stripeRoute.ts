// src/routes/stripeRoute.ts
import express from "express";
import { createCartCheckoutSession, stripeWebhook } from "../controllers/stripeController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// ----------------------------
// 🚨 STRIPE WEBHOOK (NO AUTH!)
// Must use raw body ONLY
// ----------------------------
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    console.log("🔥 WEBHOOK HIT!");
    console.log("Headers:", req.headers);
    console.log("Body length:", (req.body as Buffer).length);
    res.status(200).send("ok");
  }
);

// ----------------------------
// 💳 Checkout (Protected)
// ----------------------------
router.post(
  "/cart-checkout",
  authenticateToken,
  express.json(), // ensure JSON parsing here
  createCartCheckoutSession
);

export default router;