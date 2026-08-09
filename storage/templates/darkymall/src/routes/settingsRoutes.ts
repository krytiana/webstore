import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/settings", getSettings);

router.put(
  "/settings",
  authenticateToken,
  requireAdmin,
  updateSettings
);

export default router;