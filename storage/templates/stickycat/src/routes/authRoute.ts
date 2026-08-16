// src/routes/authRoute.ts
import express from 'express';
import { requestPasswordReset, resetPassword, validateToken, getMe } from '../controllers/authController';
import { authenticateToken } from "../middlewares/authMiddleware";
import { rateLimit } from "../middlewares/rateLimit";

const router = express.Router();

// Password Reset Routes
router.post('/request-password-reset', rateLimit(15 * 60 * 1000, 5), requestPasswordReset);
router.post('/reset-password/:token', rateLimit(15 * 60 * 1000, 10), resetPassword);
router.get("/me", authenticateToken, getMe);

// Token Validation Route
router.get('/validate-token',authenticateToken,  validateToken);

export default router;

