import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User";
import { sendResetEmail } from "../services/emailService";
import { RequestWithUser } from "../middlewares/authMiddleware";

const normalizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const resetPassword = async (req: Request, res: Response) => {
  const token = typeof req.params.token === "string" ? req.params.token : "";
  const newPassword = req.body?.newPassword;

  if (!/^[a-f0-9]{64}$/i.test(token) || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ message: "Invalid reset request" });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    // Invalidate existing sessions after a password change.
    user.refreshToken = null;

    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);

  if (!email) {
    return res.status(200).json({
      message: "If the email exists, a reset link will be sent.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");

      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      try {
        await sendResetEmail(email, resetToken);
      } catch (error) {
        console.error("Password reset email failed:", error);
      }
    }

    return res.status(200).json({
      message: "If the email exists, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Error in password reset request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateToken = (req: RequestWithUser, res: Response) => {
  res.status(200).json({
    message: "Token is valid",
    user: req.user,
  });
};

export const getMe = async (req: RequestWithUser, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("username email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.username,
      email: user.email,
      role: user.role,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
