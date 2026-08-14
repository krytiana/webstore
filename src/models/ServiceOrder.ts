import mongoose, { Document, Schema } from "mongoose";

export interface IServiceOrder extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;

  plan: "assistedSetup" | "doneForYou";

  paymentReference: string;

  paymentStatus: "paid" | "failed";

  status:
    | "pending"
    | "inProgress"
    | "completed"
    | "cancelled";
}

const serviceOrderSchema = new Schema<IServiceOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    plan: {
      type: String,
      enum: ["assistedSetup", "doneForYou"],
      required: true,
    },

    paymentReference: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "failed"],
      default: "paid",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "inProgress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IServiceOrder>(
  "ServiceOrder",
  serviceOrderSchema
);