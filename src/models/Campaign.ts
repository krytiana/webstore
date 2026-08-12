// Campaign Model
import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
    subject: string;
    content: string;

    totalRecipients: number;
    successful: number;
    failed: number;

    status: "sending" | "completed" | "failed";

    createdAt: Date;
    completedAt?: Date;
}

const campaignSchema = new Schema<ICampaign>(
    {
        subject: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
        },

        totalRecipients: {
            type: Number,
            default: 0,
        },

        successful: {
            type: Number,
            default: 0,
        },

        failed: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["sending", "completed", "failed"],
            default: "sending",
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICampaign>(
    "Campaign",
    campaignSchema
);