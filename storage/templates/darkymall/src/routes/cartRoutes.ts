// src/routes/cartRoutes.ts
import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart
} from "../controllers/cartController";

import { authenticateToken }
from "../middlewares/authMiddleware";

const router = express.Router();


router.post("/add", authenticateToken, addToCart);

router.get("/", authenticateToken, getCart);

router.post("/remove",
  authenticateToken,
  removeFromCart
);

router.post(
  "/update",
  authenticateToken,
  (req, res, next) => {
   
    next();
  },
  updateCart
);

export default router;