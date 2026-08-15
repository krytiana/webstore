import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendResetEmail, sendVerificationEmail, } from "../services/emailService";
import User from "../models/User";
import Subscriber from "../models/Subscriber";

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
  const { fullname, email, username, password, country, marketingSubscribed } = req.body;

  try {
    console.log("Starting sign-up process for user:", username);

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already exists. Log in"
            : "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    const isMarketingSubscribed =
        marketingSubscribed === true ||
        marketingSubscribed === "true";

    const newUser = new User({
        fullname,
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        country,

        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,

        marketingSubscribed: isMarketingSubscribed,
        marketingSubscribedAt:
            isMarketingSubscribed ? new Date() : null,
    });

    await newUser.save();
    console.log("User saved to database");

    await sendVerificationEmail(
      newUser.email,
      verificationToken
    );

    if (isMarketingSubscribed) {
        const unsubscribeToken =
            crypto.randomBytes(32).toString("hex");

        await Subscriber.create({
            user: newUser._id,
            email: newUser.email,
            fullname: newUser.fullname,
            subscribed: true,
            subscribedAt: new Date(),
            unsubscribeToken,
        });
    }

   

    res.status(201).json({
      success: true,
      message:
        "Account created! Please check your email to verify your account.",
      emailVerificationRequired: true,
      email: newUser.email,
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
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before signing in.",
        emailVerificationRequired: true,
        email: user.email,
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // ✅ Access Token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    // ✅ Refresh Token
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ NEW: Set cookie (for dashboard/browser routes)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ⚠️ change to true in production (HTTPS)
      sameSite: "lax",
    });

    // ✅ KEEP: JSON response (for APIs)
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

export const resendVerificationEmail = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified.",
      });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;

    await user.save();

    // Send new verification email
    await sendVerificationEmail(
      user.email,
      verificationToken
    );

    return res.status(200).json({
      success: true,
      message: "A new verification email has been sent.",
    });

  } catch (error) {
    console.error("❌ Error resending verification email:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send verification email.",
    });
  }
};

