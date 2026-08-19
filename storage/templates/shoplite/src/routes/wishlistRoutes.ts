// src/routes/wishlistRoutes.ts
import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, getWishlist);
router.post("/add", authenticateToken, addToWishlist);
router.post("/remove", authenticateToken, removeFromWishlist);

export default router;