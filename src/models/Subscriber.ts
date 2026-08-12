//src/models/Subscriber.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISubscriber extends Document {
    user?: Types.ObjectId | null;

    email: string;
    fullname?: string;

    subscribed: boolean;
    subscribedAt: Date;

    unsubscribedAt?: Date | null;

    unsubscribeToken: string;
}

const SubscriberSchema = new Schema<ISubscriber>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        fullname: {
            type: String,
            trim: true,
        },

        subscribed: {
            type: Boolean,
            default: true,
            index: true,
        },

        subscribedAt: {
            type: Date,
            default: Date.now,
        },

        unsubscribedAt: {
            type: Date,
            default: null,
        },

        unsubscribeToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Subscriber = mongoose.model<ISubscriber>(
    "Subscriber",
    SubscriberSchema
);

export default Subscriber;