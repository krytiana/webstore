//src/routes/stripeRoute.ts
import express from "express";
import { createCartCheckoutSession, stripeWebhook } from "../controllers/stripeController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Only logged-in users can create checkout session
router.post("/cart-checkout", authenticateToken, createCartCheckoutSession);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;