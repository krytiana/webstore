import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  upload.single("image"),
  (err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError || err?.message === "Only image files are allowed") {
      return res.status(400).json({
        success: false,
        message: err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5MB or smaller"
          : err.message,
      });
    }
    next(err);
  },
  uploadImage
);

export default router;
