import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    summary: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "new"
    }

}, {
    timestamps: true
});


export const Lead = mongoose.model(
    "Lead",
    leadSchema
);