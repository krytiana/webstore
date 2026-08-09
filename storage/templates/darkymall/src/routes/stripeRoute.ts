//src/routes/stripeRoute.ts
import express from "express";
import { createCartCheckoutSession, verifyStripeSuccess } from "../controllers/stripeController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Only logged-in users can create checkout session
router.post("/cart-checkout", authenticateToken, createCartCheckoutSession);

router.post(
  "/verify-success",
  authenticateToken,
  verifyStripeSuccess
);

export default router;