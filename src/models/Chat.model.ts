// src/models/Chat.model.ts
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true
        },

        currentNode: {
            type: String,
            default: "main-menu"
        },

        activeOption: {
            type: String,
            default: null
        },

        lockedNodes: {
            type: [String],
            default: []
        },

        flow: {
            type: String,
            enum: ["menu", "browse", "custom", "support", "company", "lead"],
            default: "menu"
        },

        pendingAction: {
            type: String,
            default: null
        },

        selectedTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Chat", chatSchema);