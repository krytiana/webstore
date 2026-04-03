//src/models/ProductModel.ts

import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  description: string;

  features: {
    frontend: string[];
    backend: string[];
    techStack: string;
  };

  pricing: {
    cardType: "static" | "complex";
    sourceCode: number;
    assistedSetup: number;
    doneForYou: number;
  };

  media: {
    image: string;
    demoUrl?: string;
  };

  isActive: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },

    slug: { type: String,  unique: true },

    category: { type: String, required: true },

    description: { type: String },

    features: {
      frontend: [{ type: String }],
      backend: [{ type: String }],
      techStack: { type: String },
    },

    pricing: {
      cardType: {
        type: String,
        enum: ["static", "complex"],
        required: true,
      },
      sourceCode: { type: Number, required: true },
      assistedSetup: { type: Number, required: true },
      doneForYou: { type: Number, required: true },
    },

    media: {
      image: { type: String, required: true },
      demoUrl: { type: String },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Auto-generate slug from name if not provided
 */
ProductSchema.pre("validate", function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});


export default model<IProduct>("Product", ProductSchema);
