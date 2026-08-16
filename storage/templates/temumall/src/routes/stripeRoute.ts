import express from "express";
import {
  createCartCheckoutSession,
  verifyStripeSuccess,
} from "../controllers/stripeController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { rateLimit } from "../middlewares/rateLimit";

const router = express.Router();

router.post(
  "/cart-checkout",
  rateLimit(10 * 60 * 1000, 10),
  authenticateToken,
  createCartCheckoutSession
);

router.post(
  "/verify-success",
  verifyStripeSuccess
);

export default router;
