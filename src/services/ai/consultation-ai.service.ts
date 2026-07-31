//src/services/ai/consultation-ai.service.ts
import { Request } from "express";

import { Lead } from "../../models/Lead.model";

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

            ai: {
                mode: "consultation",
                action: null
            },

            action: "ai",

            message: reply
        };
    }

    static async reply(
        req: Request,
        message: string
    ) {

        // 1. Save user message
        ConversationService.addUser(req, message);

        // 2. Ask Groq
        const reply = await AIService.generateResponse(
            ConversationService.get(req),
            message,
            {
                systemPrompt: ConsultantPromptService.build(),
                includeProducts: false
            }
        );

        // 3. Save only the website summary
        const summaryMatch = reply.match(
            /Website Type:[\s\S]*/
        );

        if (summaryMatch) {
            ConversationService.setWebsiteSummary(
                req,
                summaryMatch[0].trim()
            );
        }

        // 4. Save assistant message
        ConversationService.addAssistant(req, reply);

        // 5. Detect contact details
        let name = "";
        let email = "";
        let phone = "";

        // Format 1: With labels
        const labeledMatch = message.match(
            /Name:\s*(.+)\nEmail:\s*(.+)\n(?:WhatsApp|Phone):\s*(.+)/i
        );

        if (labeledMatch) {

            name = labeledMatch[1].trim();
            email = labeledMatch[2].trim();
            phone = labeledMatch[3].trim();

        } else {

            // Format 2: Three plain lines
            const lines = message
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean);

            if (
                lines.length >= 3 &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lines[1])
            ) {
                name = lines[0];
                email = lines[1];
                phone = lines[2];
            }
        }

        // 6. Save lead once
        if (
            name &&
            email &&
            !ConversationService.getSession(req).leadCaptured
        ) {

            await Lead.create({

                name,

                email,

                phone,

                summary: ConversationService.getWebsiteSummary(req)

            });

            ConversationService.getSession(req).leadCaptured = true;
        }

        return reply;
    }

}