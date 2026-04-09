// src/routes/authRoute.ts
import express, { Request, Response } from 'express';
import { requestPasswordReset, resetPassword, validateToken, getMe } from '../controllers/authController';
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Password Reset Routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.get("/me", authenticateToken, getMe);

// Token Validation Route
router.get('/validate-token',  validateToken);

router.get("/logout", (req: Request, res: Response) => {
  // ❌ Remove token cookie
  res.clearCookie("token");

  // ✅ Optional: destroy refresh token in DB (if you want stronger security)

  // 🔁 Redirect to login
  res.redirect("/register");
});

export default router;

