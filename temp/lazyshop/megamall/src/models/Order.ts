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

  stripeSessionId: string;

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
        default: 1
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
    required: true
  },

  stripeSessionId: {
    type: String,
    required: true
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
    unique: true
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
{ timestamps: true }
);

export default mongoose.model<IOrder>(
  "Order",
  OrderSchema
);