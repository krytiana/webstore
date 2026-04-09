//src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { db } from '../config/db'; // Import MongoDB connection

// Custom interface for the JWT payload
interface CustomJwtPayload extends JwtPayload {
  id: string;
  userId: string;
  email: string;
  username: string;
}

// Extend Request object to include user property
export interface RequestWithUser extends Request {
  user?: CustomJwtPayload;
}

// Middleware to authenticate access token
const authenticateToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {

  // Debug (optional – remove in production)
  console.log("HEADERS:", req.headers.authorization);
  console.log("COOKIES:", req.cookies);

  // ✅ Get token from header OR cookie
  const token =
    req.header("Authorization")?.split(" ")[1] ||
    req.cookies?.token;

  // ✅ Detect request type
  const isApiRequest = req.originalUrl.startsWith("/api");

  // ❌ No token
  if (!token) {
    if (isApiRequest) {
      return res.status(401).json({
        message: "Access Denied. No token provided.",
      });
    } else {
      return res.redirect("/register");
    }
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    if (isApiRequest) {
      return res.status(403).json({
        message: "Invalid Token",
      });
    } else {
      return res.redirect("/login");
    }
  }
};

export { authenticateToken };

// Refresh Token Endpoint
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as CustomJwtPayload;
    const userObjectId = new ObjectId(decoded.userId);

    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) return res.sendStatus(403);
    if (user.refreshToken !== refreshToken) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { id: user._id.toString(), userId: user._id.toString(), email: user.email, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token verification error:", error);
    return res.sendStatus(403);
  }
};
