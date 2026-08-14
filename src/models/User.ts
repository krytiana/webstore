// src/models/user.ts
import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  fullname: string;
  email: string;
  username: string;
  password: string;
  country: string;

  role: "user" | "admin";

  refreshToken?: string | null;

  resetToken?: string | null;
  resetTokenExpiry?: Date | null;

  stripeCustomerId?: string | null;

  // Email verification
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpiry?: Date | null;

  // Marketing subscription
  marketingSubscribed: boolean;
  marketingSubscribedAt?: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    refreshToken: {
      type: String,
      default: null,
    },

    resetToken: {
      type: String,
      default: null,
      index: true,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    stripeCustomerId: {
      type: String,
      default: null,
    },

    // ---------------------------
    // Email verification
    // ---------------------------

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      index: true,
    },

    emailVerificationExpiry: {
      type: Date,
      default: null,
    },

    // ---------------------------
    // Marketing subscription
    // ---------------------------

    marketingSubscribed: {
      type: Boolean,
      default: false,
    },

    marketingSubscribedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export { IUser };
export default User;