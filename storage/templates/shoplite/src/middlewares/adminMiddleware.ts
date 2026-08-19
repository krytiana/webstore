// src/middlewares/adminMiddleware.ts

import { Response, NextFunction } from "express";
import { RequestWithUser } from "./authMiddleware";
import User from "../models/User";

export const requireAdmin = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {

  try {

    // No user
    if (!req.user?.userId) {

      if (req.originalUrl.startsWith("/api")) {

        return res.status(401).json({
          message: "Unauthorized"
        });

      } else {

        return res.redirect(
          "/register?message=Please login as admin"
        );
      }
    }

    // Quick token role check
    if (req.user.role !== "admin") {

      if (req.originalUrl.startsWith("/api")) {

        return res.status(403).json({
          message: "Admin only access"
        });

      } else {

        return res.redirect(
          "/register?message=Admin access required"
        );
      }
    }

    // Verify from database
    const user = await User.findById(req.user.userId);

    if (!user) {

      if (req.originalUrl.startsWith("/api")) {

        return res.status(404).json({
          message: "User not found"
        });

      } else {

        return res.redirect(
          "/register?message=Account not found"
        );
      }
    }

    // Final admin check
    if (user.role !== "admin") {

      if (req.originalUrl.startsWith("/api")) {

        return res.status(403).json({
          message: "Admin only access"
        });

      } else {

        return res.redirect(
          "/register?message=You are not authorized as admin"
        );
      }
    }

    next();

  } catch (error) {

    if (req.originalUrl.startsWith("/api")) {

      console.error("Admin authorization error:", error);
      return res.status(500).json({
        message: "Server error"
      });

    } else {

      return res.redirect(
        "/register?message=Something went wrong"
      );
    }
  }
};