// src/routes/authRoute.ts
import express from 'express';
import { requestPasswordReset, resetPassword, validateToken, getMe } from '../controllers/authController';
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Password Reset Routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.get("/me", authenticateToken, getMe);

// Token Validation Route
router.get('/validate-token',  validateToken);

export default router;

