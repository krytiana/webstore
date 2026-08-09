//src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user?: CustomJwtPayload;
}

const authenticateToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {

  const token =
    req.cookies?.token ||
    req.headers['authorization']?.split(' ')[1];

  // No token
  if (!token) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({
        message: "No token provided"
      });
    } else {
      return res.redirect(
        "/register?message=Please login first"
      );
    }
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    req.user = decoded;

    next();

  } catch (err: any) {

    if (req.originalUrl.startsWith("/api")) {

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired"
        });
      }

      return res.status(403).json({
        message: "Invalid token"
      });

    } else {

      // Expired token
      if (err.name === "TokenExpiredError") {
        return res.redirect(
          "/register?message=Session expired. Please login again"
        );
      }

      // Invalid token
      return res.redirect(
        "/register?message=Invalid authentication token"
      );
    }
  }
};

export { authenticateToken };