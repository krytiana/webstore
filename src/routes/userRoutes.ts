//src/routes/userRoutes.ts
import { Router } from "express";
import { db } from "../config/db";
import { handleSignUp, handleSignIn, handleForgotPassword, refreshAccessToken, getUsers } from "../controllers/userController";
import { authenticateToken, RequestWithUser } from "../middlewares/authMiddleware";
import { ObjectId } from "mongodb";

const router = Router();


router.post("/signup", handleSignUp);
router.post("/signin", handleSignIn);
router.post("/forgot-password", handleForgotPassword);
router.post("/refresh-token", refreshAccessToken);
router.get('/', getUsers);

// Get user profile
router.get("/profile", authenticateToken, async (req: RequestWithUser, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Convert string to ObjectId
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            message: "Welcome to your profile",
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
    }
});

export default router;