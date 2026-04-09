// src/routes/dashboardRoute.ts
import { Router } from "express";

const router = Router();

// Public route: dashboard EJS renders first
router.get("/", (req, res) => {
  res.render("dashboard"); // no token required on server side
});

export default router;