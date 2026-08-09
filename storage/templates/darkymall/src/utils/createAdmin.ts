import bcrypt from "bcrypt";
import User from "../models/User";

export const createAdminIfNotExists = async () => {
  try {
    console.log("👉 Running admin seeder...");

    console.log("ENV:", {
      email: process.env.ADMIN_EMAIL,
      username: process.env.ADMIN_USERNAME,
    });

    const email = process.env.ADMIN_EMAIL;

    if (!email) {
      console.log("❌ ADMIN_EMAIL missing in .env");
      return;
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("✅ Admin already exists:", existingAdmin.email);
      return;
    }

    console.log("🆕 Creating new admin...");

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD as string,
      10
    );

    const admin = new User({
      fullname: process.env.ADMIN_FULLNAME,
      email: process.env.ADMIN_EMAIL,
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      country: process.env.ADMIN_COUNTRY,
      role: "admin",
    });

    await admin.save();

    console.log("🔥 Admin created successfully");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};