// src/models/cart.ts
import mongoose, { Document, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId | any;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
}

const cartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },

      quantity: {
        type: Number,
        default: 1
      },

      selectedOptions: {
        type: Object,
        default: {}
      }
    }
  ]
}, { timestamps: true });

export const Cart = mongoose.model<ICart>("Cart", cartSchema);