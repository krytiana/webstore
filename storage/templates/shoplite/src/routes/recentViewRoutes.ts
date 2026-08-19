import express from "express";
import { addRecentView, getRecentViews } from "../controllers/recentViewController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authenticateToken, addRecentView);
router.get("/", authenticateToken, getRecentViews);

export default router;