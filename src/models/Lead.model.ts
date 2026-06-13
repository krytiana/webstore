import mongoose, {
    Schema,
    Document
} from "mongoose";

export interface ILead extends Document {

    name?: string;

    email?: string;

    phone?: string;

    projectType?: string;

    businessType?: string;

    summary?: string;

    status: string;

    createdAt: Date;
}

const LeadSchema = new Schema<ILead>(

    {
        name: String,

        email: String,

        phone: String,

        projectType: String,

        businessType: String,

        summary: String,

        status: {
            type: String,
            default: "new"
        }
    },

    {
        timestamps: true
    }
);

export default mongoose.model<ILead>(
    "Lead",
    LeadSchema
);