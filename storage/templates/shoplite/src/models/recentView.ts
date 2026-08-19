import mongoose from "mongoose";

const recentViewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      viewedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export const RecentView = mongoose.model("RecentView", recentViewSchema);