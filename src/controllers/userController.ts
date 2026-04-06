import { Request, Response } from "express";
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
    { expiresIn: "7d" }
  );
};

// Handle Sign Up
export const handleSignUp = async (req: Request, res: Response) => {
  const { fullname, email, username, password, country } = req.body;

  try {
    console.log("Starting sign-up process for user:", username);

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
    console.log("User saved to database");

    const token = jwt.sign(
      { userId: newUser._id, email, username },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    const refreshToken = generateRefreshToken(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Sign-up successful",
      token,
      refreshToken,
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
    console.log(`Attempting sign-in for email: ${email}`);

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
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Sign-in successful",
      token,
      refreshToken,
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

    console.log("Reset token generated:", token);

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
export const refreshAccessToken = async (
  req: Request,
  res: Response
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken,
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Error refreshing access token:", error);

    res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
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