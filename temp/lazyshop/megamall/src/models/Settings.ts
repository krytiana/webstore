// src/models/Settings.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  logo: string;
  heroImages: string[];
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  contactEmail: string;
  contactPhone: string;
  footerText: string;

}

const settingsSchema = new Schema<ISettings>({
  siteName: { type: String, default: "My Store" },
  logo: { type: String, default: "/images/logo.png" },
  heroImages: { type: [String], default: [] },
  primaryColor: { type: String, default: "#2563eb" },
  secondaryColor: { type: String, default: "#7c3aed" },
  backgroundColor: { type: String, default: "#f8fafc" },
  surfaceColor: { type: String, default: "#ffffff" },
  textColor: { type: String, default: "#111827" },
  borderColor: { type: String, default: "#d7dee5" },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  footerText: { type: String, default: "© 2026 My Store" }
});

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);