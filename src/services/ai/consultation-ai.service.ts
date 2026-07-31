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

        const session = ConversationService.getSession(req);


        // 0. Stop AI after consultation is completed
        if (session.leadCaptured) {

            return `
    The consultation has already ended.

    If you need to add anything or have questions about your project, please contact our technical team:

    WhatsApp: +233555952767
            `.trim();

        }


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


        // 3. Save only website summary
        const summaryMatch = reply.match(
            /Website Type:[\s\S]*?(?=\n\s*Now\b|$)/i
        );


        if (summaryMatch) {

            ConversationService.setWebsiteSummary(
                req,
                summaryMatch[0].trim()
            );

        }



        // 4. Detect contact details
        let name = "";
        let email = "";
        let phone = "";


        // Format 1: Flexible labeled format
        const labeledMatch = message.match(
            /Name:\s*(.*?)\s+Email:\s*([^\s]+)\s+(?:WhatsApp\s*(?:or\s*)?Phone(?:\s*number)?|Phone(?:\s*number)?):\s*(.+)/i
        );


        if (labeledMatch) {

            name = labeledMatch[1].trim();
            email = labeledMatch[2].trim();
            phone = labeledMatch[3].trim();

        } 

        else {

            // Format 2: Three separate lines
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

console.log({
    name,
    email,
    phone
});

        // 5. Save lead and end consultation
        if (
            name &&
            email &&
            !session.leadCaptured
        ) {


            await Lead.create({

                name,

                email,

                phone,

                summary:
                    ConversationService.getWebsiteSummary(req)

            });


            session.leadCaptured = true;


            const closingMessage = `
    Thank you ${name}, your website requirements have been received successfully.

    Our team will review your project details and contact you soon.

    The consultation has now ended.

    If you need to add anything or have questions about your project, please contact our technical team:

    WhatsApp: +233555952767
            `.trim();


            ConversationService.addAssistant(
                req,
                closingMessage
            );


            return closingMessage;

        }



        // 6. Save normal AI response
        ConversationService.addAssistant(
            req,
            reply
        );


        return reply;
    }

}