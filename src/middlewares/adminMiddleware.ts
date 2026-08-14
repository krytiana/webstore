import { Response, NextFunction } from "express";
import User from "../models/User";
import { RequestWithUser } from "./authMiddleware";

export const requireAdmin = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.user.userId).select("role");

    if (!user) {
      return res.redirect("/login");
    }

    if (user.role !== "admin") {
      return res.status(403).send("Access denied");
    }

    next();
  } catch (error) {
    console.error("❌ Admin authorization error:", error);

    return res.status(500).send("Authorization error");
  }
};