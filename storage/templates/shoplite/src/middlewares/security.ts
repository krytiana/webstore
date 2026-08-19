import { NextFunction, Request, Response } from "express";
const stateChangingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const publicWebhookPaths = new Set(["/api/stripe/webhook", "/api/paystack/webhook"]);
export const sameOriginProtection = (req: Request, res: Response, next: NextFunction) => {
  if (!stateChangingMethods.has(req.method) || publicWebhookPaths.has(req.path)) return next();
  const origin = req.get("origin");
  if (!origin) return next();
  const allowed = process.env.CLIENT_URL?.replace(/\/+$/, "");
  if (allowed && origin !== allowed) return res.status(403).json({ success: false, message: "Cross-origin request blocked" });
  next();
};
