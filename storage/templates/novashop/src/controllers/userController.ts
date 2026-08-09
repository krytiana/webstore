// src/controllers/userController.ts
import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "../services/emailService";
import User from "../models/User";

// Generate Refresh Token
const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "3d" }
  );
};

// Handle Sign Up
export const handleSignUp = async (req: Request, res: Response) => {
  const { fullname, email, username, password, country } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already exists."
            : "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      username,
      password: hashedPassword,
      country,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email, username, role: newUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    const refreshToken = generateRefreshToken(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      sameSite: "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.status(201).json({
      success: true,
      message: "Sign-up successful",
    });
  } catch (error) {
    console.error("Error during sign up:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Handle Sign In
export const handleSignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      sameSite: "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      sameSite: "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

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

// Handle Forgot Password
export const handleForgotPassword = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  try {
    console.log(
      `Received forgot password request for email: ${email}`
    );

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const token = crypto.randomBytes(20).toString("hex");

    const expireTime = new Date(Date.now() + 3600000);

    user.resetToken = token;
    user.resetTokenExpiry = expireTime;

    await user.save();

    await sendResetEmail(email, token);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Error during forgot password process:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Handle Refresh Token
export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // 1. Verify token
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    // 2. Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    // 3. Match stored refresh token (prevents stolen token reuse)
    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 4. Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // 5. OPTIONAL BUT RECOMMENDED: rotate refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "3d" }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    // 6. Set cookies
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Token refreshed successfully",
    });

  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(403).json({ message: "Expired or invalid refresh token" });
  }
};

// Get Users
export const getUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find(
      {},
      "-password -refreshToken -resetToken -resetTokenExpiry"
    );

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

// logout function
export const logout = (req: Request, res: Response) => {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"   // 🔥 IMPORTANT
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.json({ success: true, message: "Logged out" });
};