import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { sendResetEmail } from "../services/emailService";

const ACCESS_TTL = "1h";
const REFRESH_TTL = "3d";

const generateRefreshToken = (user: any) =>
  jwt.sign(
    { userId: user._id.toString() },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: REFRESH_TTL }
  );

const cookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge,
});

const validatePassword = (password: unknown) =>
  typeof password === "string" && password.length >= 8 && password.length <= 128;
const validateUsername = (username: string) => /^[a-zA-Z0-9._-]{3,80}$/.test(username);
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeEmail = (email: unknown) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const handleSignUp = async (req: Request, res: Response) => {
  const fullname = typeof req.body.fullname === "string" ? req.body.fullname.trim() : "";
  const email = normalizeEmail(req.body.email);
  const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
  const password = req.body.password;
  const country = typeof req.body.country === "string" ? req.body.country.trim() : "";

  if (!fullname || !email || !validateEmail(email) || !username || !validateUsername(username) || !country || !validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid account details. Password must be at least 8 characters.",
    });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with those credentials already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullname: fullname.slice(0, 150),
      email,
      username: username.slice(0, 80),
      password: hashedPassword,
      country: country.slice(0, 100),
      role: "user",
    });

    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: ACCESS_TTL }
    );

    const refreshToken = generateRefreshToken(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("token", token, cookieOptions(60 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, cookieOptions(3 * 24 * 60 * 60 * 1000));

    return res.status(201).json({
      success: true,
      message: "Sign-up successful",
    });
  } catch (error: any) {
    console.error("Error during sign up:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleSignIn = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  try {
    const user = await User.findOne({ email });

    // Same public response for both cases to reduce account enumeration.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: ACCESS_TTL }
    );

    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("token", token, cookieOptions(60 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, cookieOptions(3 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Sign-in successful",
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleForgotPassword = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "If the email exists, a reset link will be sent.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      user.resetToken = token;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      try {
        await sendResetEmail(email, token);
      } catch (emailError) {
        console.error("Password reset email failed:", emailError);
      }
    }

    // Never reveal whether the account exists.
    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Error during forgot password process:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken || typeof refreshToken !== "string") {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload;

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: ACCESS_TTL }
    );

    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("token", newAccessToken, cookieOptions(60 * 60 * 1000));
    res.cookie("refreshToken", newRefreshToken, cookieOptions(3 * 24 * 60 * 60 * 1000));

    return res.json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (err) {
    return res.status(403).json({
      message: "Expired or invalid refresh token",
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find(
      {},
      "-password -refreshToken -resetToken -resetTokenExpiry"
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await User.updateOne(
      { refreshToken },
      { $set: { refreshToken: null } }
    ).catch(() => undefined);
  }

  res.clearCookie("token", cookieOptions(0));
  res.clearCookie("refreshToken", cookieOptions(0));

  return res.json({ success: true, message: "Logged out" });
};
