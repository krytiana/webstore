//src/models/order.ts
import mongoose, {
  Document,
  Schema
} from "mongoose";

export interface IOrder extends Document {

  user: mongoose.Types.ObjectId;

  items: {
    product: mongoose.Types.ObjectId;

    name: string;
    image: string;
    price: number;

    quantity: number;

    selectedOptions?: Record<string, string>;
  }[];

  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    region: string;
    country: string;
  };

  totalAmount: number;

  // ----------------------------
  // Payment
  // ----------------------------

  paymentProvider:
    | "stripe"
    | "paystack";

  stripeSessionId?: string;

  paystackReference?: string;

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  orderNumber: string;

  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

  trackingHistory: {
    status: string;
    message: string;
    updatedAt: Date;
  }[];

  trackingNumber?: string;

  courier?: string;

  estimatedDelivery?: Date;
}


const OrderSchema = new Schema(
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
          ref: "Product",
          required: true
        },

        name: {
          type: String,
          required: true
        },

        image: {
          type: String
        },

        price: {
          type: Number,
          required: true
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
          max: 100
        },

        selectedOptions: {
          type: Map,
          of: String,
          default: {}
        }
      }
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },

      phone: {
        type: String,
        required: true
      },

      addressLine: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      },

      region: {
        type: String,
        required: true
      },

      country: {
        type: String,
        required: true
      }
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // ----------------------------
    // Payment
    // ----------------------------

    paymentProvider: {
      type: String,
      enum: [
        "stripe",
        "paystack"
      ],
      required: true
    },

    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true
    },

    paystackReference: {
      type: String,
      unique: true,
      sparse: true
    },

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "failed"
      ],

      default: "pending"
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    orderStatus: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled"
      ],

      default: "pending"
    },

    trackingHistory: [
      {
        status: String,

        message: String,

        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    trackingNumber: {
      type: String
    },

    courier: {
      type: String
    },

    estimatedDelivery: {
      type: Date
    }
  },

  {
    timestamps: true
  }
);


export default mongoose.model(
  "Order",
  OrderSchema
);