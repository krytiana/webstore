//src/routes/userRoutes.ts
import { Router } from "express";
import { handleSignUp, handleSignIn, handleForgotPassword, refreshAccessToken, getUsers } from "../controllers/userController";
import { logout } from "../controllers/userController";
import { authenticateToken, RequestWithUser } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/adminMiddleware";
import User from "../models/User";
import { rateLimit } from "../middlewares/rateLimit";

const router = Router();


router.post("/signup", rateLimit(15 * 60 * 1000, 10), handleSignUp);
router.post("/signin", rateLimit(15 * 60 * 1000, 10), handleSignIn);
router.post("/forgot-password", rateLimit(15 * 60 * 1000, 5), handleForgotPassword);
router.post("/refresh-token", rateLimit(15 * 60 * 1000, 30), refreshAccessToken);
router.get('/',authenticateToken, requireAdmin, getUsers);
router.post("/logout", logout);

// Get user profile
router.get("/profile", authenticateToken, async (req: RequestWithUser, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId).select("username email role");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            message: "Welcome to your profile",
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
    }
});

export default router;