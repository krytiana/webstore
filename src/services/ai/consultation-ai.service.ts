//src/services/ai/consultation-ai.service.ts
import { Request } from "express";

import { AIService } from "../ai.service";
import { ConversationService } from "../conversation.service";
import { ConsultantPromptService } from "../../prompts/consultant.prompt";

export class ConsultationAIService {

    static async start(req: Request) {

        ConversationService.start(req, "consultation");

        const reply = await AIService.generateResponse(
            [],
            "Start the consultation.",
            {
                systemPrompt: ConsultantPromptService.build(),
                includeProducts: false
            }
        );

        ConversationService.addAssistant(req, reply);

        return {
            success: true,
            action: "ai",
            message: reply
        };

    }

    static async reply(
        req: Request,
        message: string
    ) {

        ConversationService.addUser(req, message);

        const reply = await AIService.generateResponse(
            ConversationService.get(req),
            message,
            {
                systemPrompt: ConsultantPromptService.build(),
                includeProducts: false
            }
        );

        ConversationService.addAssistant(req, reply);

        return reply;
    }

}