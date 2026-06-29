//src/services/lead.service.ts
import Lead from "../models/Lead.model";

export class LeadService {

    static async createLead(
        data: {
            name?: string;
            email?: string;
            phone?: string;
            projectType?: string;
            businessType?: string;
            summary?: string;
        }
    ) {

        return Lead.create({

            name: data.name,

            email: data.email,

            phone: data.phone,

            projectType: data.projectType,

            businessType: data.businessType,

            summary: data.summary,

            status: "new"
        });
    }
}