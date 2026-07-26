//src/actions/customConsultation.action.ts

import { AIService } from "../services/ai.service";
import { ConsultantPromptService } from "../prompts/consultant.prompt";

export class CustomConsultationAction {

    static async start(chat: any, data?: any) {

        const websiteType =
           data?.websiteType || "custom website";
           
        const prompt = ConsultantPromptService.build(
            websiteType
        );

        const reply = await AIService.generateResponse(
            [],
            "Start the consultation.",
            {
                systemPrompt: prompt,
                includeProducts: false
            }
        );

        return {
            success: true,
            action: "ai",
            message: reply,
            ai: {
                mode: "consultation"
            }
        };

    }

}