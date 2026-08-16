//src/models/user.ts
import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  fullname: string;
  email: string;
  username: string;
  password: string;
  country: string;
  refreshToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  stripeCustomerId?: string | null;
  role: "user" | "admin";
}

const UserSchema = new Schema<IUser>(
  {
    fullname: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    username: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    password: { type: String, required: true },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    refreshToken: { type: String, default: null },
    resetToken: { type: String, default: null, index: true }, // Indexed for faster lookup
    resetTokenExpiry: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true }, // Indexed for role-based queries
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export { IUser };
export default User;