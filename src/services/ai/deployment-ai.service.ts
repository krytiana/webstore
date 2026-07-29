//src/services/ai/deployment-ai.service.ts
import { Request } from "express";

import { AIService } from "../ai.service";
import { ConversationService } from "../conversation.service";
import { DeploymentPromptService } from "../../prompts/deployment.prompt";

export class DeploymentAIService {

    static async start(
        req: Request,
        action: string
    ) {

        ConversationService.start(req, "deployment");

        const prompt = DeploymentPromptService.build(action);

        const reply = await AIService.generateResponse(
            [],
            "Start the deployment support conversation.",
            {
                systemPrompt: prompt,
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
        action: string,
        message: string
    ) {

        ConversationService.addUser(req, message);

        const reply = await AIService.generateResponse(
            ConversationService.get(req),
            message,
            {
                systemPrompt: DeploymentPromptService.build(action),
                includeProducts: false
            }
        );

        ConversationService.addAssistant(req, reply);

        return reply;
    }

}