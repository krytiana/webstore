//src/models/order.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;

  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];

  totalAmount: number;

  stripeSessionId: string;

  paymentStatus: "pending" | "paid" | "failed";

  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
}

const OrderSchema = new Schema<IOrder>(
{
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  stripeSessionId: {
    type: String,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  orderStatus: {
    type: String,
    enum: ["processing", "shipped", "delivered", "cancelled"],
    default: "processing"
  }

},
{ timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);