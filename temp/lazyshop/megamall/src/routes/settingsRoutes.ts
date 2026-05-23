import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";

const router = express.Router();

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;