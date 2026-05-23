// src/routes/deployRoute.ts

import { Router } from "express";
import { showDeployPage } from "../controllers/deployController";

const router = Router();

router.get("/:productId", showDeployPage);

export default router;