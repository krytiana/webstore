import bcrypt from "bcrypt";
import User from "../models/User";

export const createAdminIfNotExists = async () => {
  const required = [
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_USERNAME",
    "ADMIN_FULLNAME",
    "ADMIN_COUNTRY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required admin environment variables: ${missing.join(", ")}`
      );
    }

    console.warn(
      `Admin seeder skipped; missing: ${missing.join(", ")}`
    );
    return;
  }

  const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const username = process.env.ADMIN_USERNAME!.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL is invalid");
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) throw new Error("ADMIN_USERNAME is invalid");
  if (process.env.ADMIN_PASSWORD!.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  const existingAdmin = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      throw new Error(
        "ADMIN_EMAIL or ADMIN_USERNAME belongs to a non-admin account"
      );
    }

    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD!,
    12
  );

  await User.create({
    fullname: process.env.ADMIN_FULLNAME!.trim(),
    email,
    username,
    password: hashedPassword,
    country: process.env.ADMIN_COUNTRY!.trim(),
    role: "admin",
  });
};
