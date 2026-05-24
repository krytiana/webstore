import { Router } from "express";
import {
  showDeployGuide
} from "../controllers/deployGuideController";

const router = Router();

router.get(
  "/deploy-guide/:productId",
  showDeployGuide
);

export default router;