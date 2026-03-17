import { Router } from "express";
import { getPricing } from "../controllers/pricingController";

const router = Router();

// GET /pricing
router.get("/", getPricing);

export default router;
