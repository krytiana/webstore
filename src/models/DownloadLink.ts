// src/models/DownloadLink.ts
import mongoose, { Schema } from "mongoose";

const downloadLinkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  plan: { type: String, required: true },
  url: { type: String, required: false },
  maxDownloads: { type: Number, default: 3 },
  successfulDownloads: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model("DownloadLink", downloadLinkSchema);