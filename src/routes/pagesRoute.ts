import { Router } from "express";
import { homePage } from "../controllers/pageController";

const router = Router();

router.get("/", homePage);

export default router;
