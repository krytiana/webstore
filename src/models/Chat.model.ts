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
         
        currentStage: {
            type: String,
            enum: ["menu", "browsing", "consulting", "leadCapture"],
            default: "menu"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Chat", chatSchema);