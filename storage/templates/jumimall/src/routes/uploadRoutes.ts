import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  upload.single("image"),
  uploadImage
);

export default router;