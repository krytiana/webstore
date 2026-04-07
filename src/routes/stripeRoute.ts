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
  stripeWebhook
);

// ----------------------------
// 💳 Checkout (Protected)
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

export default router;