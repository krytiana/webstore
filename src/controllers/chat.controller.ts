import { Request, Response } from "express";
import crypto from "crypto";

import Chat from "../models/Chat.model";
import { AIService } from "../services/ai.service";
import { LeadService } from "../services/lead.service";
import { ChatMenuService } from "../services/chat-menu.service";

export class ChatController {

    static renderChat(req: Request, res: Response): void {
        res.render("chat");
    }

    static async newChat(req: Request, res: Response) {
        try {

            const welcomeMessage = `
👋 Welcome to CodeCartHub!

I'm your project consultant.

How can I help you today?

1. 🛒 Browse website templates
2. 🎨 Customize a template
3. 💻 Build a custom website
4. 💰 Pricing & packages
5. 🛠 Technical support
6. 💬 Talk to a consultant
            `.trim();

            const chat = await Chat.create({
                sessionId: crypto.randomUUID(),
                messages: [
                    {
                        role: "assistant",
                        content: welcomeMessage
                    }
                ],
                leadCaptured: false,
                currentStage: "menu" // ⭐ PHASE 2 READY
            });

            return res.status(201).json({
                success: true,
                chatId: chat._id,
                sessionId: chat.sessionId,
                messages: chat.messages
            });

        } catch (error) {
            console.error("NEW_CHAT_ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create chat"
            });
        }
    }

    static async sendMessage(req: Request, res: Response) {
        try {

            const { chatId, message } = req.body;

            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }

            // 1. Save user message (ONLY ONCE)
            chat.messages.push({
                role: "user",
                content: message
            });

            // 2. MENU FLOW (NO AI COST)
            const menuResponse = ChatMenuService.handle(message);

            if (menuResponse) {

                chat.messages.push({
                    role: "assistant",
                    content: menuResponse
                });

                // optional: keep stage in sync
                chat.currentStage = "menu";

                await chat.save();

                return res.json({
                    success: true,
                    message: menuResponse
                });
            }

            // 3. PHASE 2 HOOK → SMART CONTEXT (we will improve next step)
            const aiResponse = await AIService.generateResponse(chat.messages, message);

            // 4. clean response
            const cleanedResponse = aiResponse
                .replace(/\[LEAD_DATA\][\s\S]*?\[\/LEAD_DATA\]/, "")
                .trim();

            // 5. lead extraction
            const leadMatch = aiResponse.match(/\[LEAD_DATA\]([\s\S]*?)\[\/LEAD_DATA\]/);

            if (leadMatch && !chat.leadCaptured) {

                const leadText = leadMatch[1];

                const name = leadText.match(/Name:\s*(.*)/)?.[1]?.trim();
                const email = leadText.match(/Email:\s*(.*)/)?.[1]?.trim();
                const phone = leadText.match(/Phone:\s*(.*)/)?.[1]?.trim();
                const projectType = leadText.match(/ProjectType:\s*(.*)/)?.[1]?.trim();
                const businessType = leadText.match(/BusinessType:\s*(.*)/)?.[1]?.trim();

                if (name && email && phone) {

                    chat.leadCaptured = true;

                    await LeadService.createLead({
                        name,
                        email,
                        phone,
                        summary: `
Project Type: ${projectType || "N/A"}
Business Type: ${businessType || "N/A"}
                        `.trim()
                    });
                }
            }

            // 6. save assistant response
            chat.messages.push({
                role: "assistant",
                content: cleanedResponse
            });

            await chat.save();

            return res.json({
                success: true,
                message: cleanedResponse
            });

        } catch (error) {

            console.error("SEND_MESSAGE_ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}