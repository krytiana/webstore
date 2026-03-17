"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
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
}, { timestamps: true });
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
exports.default = (0, mongoose_1.model)("Product", ProductSchema);
