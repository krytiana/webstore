// src/models/wishlist.ts
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      size: String,   // optional, if user wants to track size preference
      color: String   // optional
    }
  ]
}, { timestamps: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);