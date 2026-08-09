//src/models/product.ts
import mongoose, { Document, Schema } from "mongoose";

// Interface (TypeScript type)
export interface IProduct extends Document {
  category: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  specs: string;
  rating: number;
  reviews: number;
  options: Record<string, any>;
  tags: string[];
}

// Schema (MongoDB structure)
const productSchema = new Schema<IProduct>(
  {
    category: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    specs: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    options: {
      type: Object,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
export const Product = mongoose.model<IProduct>(
  "Product",
  productSchema,
  "products"
);