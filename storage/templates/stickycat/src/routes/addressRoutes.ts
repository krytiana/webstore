import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/addressController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, addAddress);
router.get("/", authenticateToken, getAddresses);
router.put("/:id", authenticateToken, updateAddress);
router.delete("/:id", authenticateToken, deleteAddress);
router.put("/default/:id", authenticateToken, setDefaultAddress);

export default router;