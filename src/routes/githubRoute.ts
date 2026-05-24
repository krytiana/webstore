// src/routes/githubRoute.ts
import { Router } from "express";
import {
  githubLogin,
  githubCallback,
  createRepo,
  deployToRepo,
  deployToRender
} from "../controllers/githubController";

const router = Router();

// Step 1: send user to GitHub
router.get("/auth/github", githubLogin);

// Step 2: GitHub returns here
router.get("/auth/github/callback", githubCallback);

router.post("/auth/github/create-repo", createRepo);

router.post("/auth/github/deploy", deployToRepo);

//router.post("/render/deploy", deployToRender); // Deactivated route, no more used.


export default router;