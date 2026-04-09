//src/controllers/authController.ts
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User";
import { sendResetEmail } from "../services/emailService";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../middlewares/authMiddleware"; // Import the custom Request interface

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;


  try {
    // Find user by reset token & check if token is still valid
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Check if token is not expired
    });

    

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
   

    // Update user password & clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

   
    res.json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour
    await user.save();

    // Send reset email
    await sendResetEmail(email, resetToken);


    res.json({ message: "Password reset email sent" });

  } catch (error) {
    console.error("❌ Error in password reset request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateToken = (req: RequestWithUser, res: Response) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // Token is valid
    res.status(200).json({ message: 'Token is valid', decoded });
  } catch (err) {
    console.error('Token validation error:', err);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

export const getMe = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select("username email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.username,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};