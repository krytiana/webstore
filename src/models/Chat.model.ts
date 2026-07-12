// src/models/Chat.model.ts
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const chatSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true
        },

        messages: [messageSchema],

        // ✅ IMPORTANT: global guard
        leadCaptured: {
            type: Boolean,
            default: false
        }, 
         
        currentNode: {
            type: String,
            default: "main"
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
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Chat", chatSchema);