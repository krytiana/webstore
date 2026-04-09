// src/routes/dashboardRoute.ts
import { Router, Response } from "express";
import { authenticateToken, RequestWithUser } from "../middlewares/authMiddleware";
import DownloadLink from "../models/DownloadLink";

const router = Router();

// Protected dashboard route
router.get("/", authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Fetch downloads for this user
    const downloads = await DownloadLink.find({ user: userId })
      .populate("product", "name media slug");

    res.render("dashboard", {
      title: "Dashboard",
      user: req.user, // pass user
      downloads
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Server error");
  }
});

export default router;