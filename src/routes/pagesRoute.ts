//src/routes/pagesRoute.ts

import { Router, Request, Response } from "express";

const router = Router();

// Home page
router.get("/", (req: Request, res: Response) => {
  res.render("home", { title: "Ready-Made Websites" });
});

// About page
router.get("/about", (req: Request, res: Response) => {
  res.render("about", { title: "About Us" });
});

// Contact page
router.get("/contact", (req: Request, res: Response) => {
  res.render("contact", { title: "Contact" });
});

export default router;
