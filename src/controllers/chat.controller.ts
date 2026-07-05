//src/controllers/chat.controller.ts
import { Request, Response } from "express";
import crypto from "crypto";

import Chat from "../models/Chat.model";
import { AIService } from "../services/ai.service";
import { LeadService } from "../services/lead.service";
import { NodeService } from "../services/NodeService";

export class ChatController {

    static renderChat(req: Request, res: Response): void {
        res.render("chat");
    }

    static async newChat(req: Request, res: Response) {
        try {

            const node = NodeService.getNode("main-menu");

            if (!node) {
                return res.status(500).json({
                    success: false,
                    message: "Main menu not found."
                });
            }
        

            const chat = await Chat.create({
                sessionId: crypto.randomUUID(),
                messages: [],
                leadCaptured: false,
                currentNode: "main-menu"
            });

            return res.status(201).json({
                success: true,
                chatId: chat._id,
                sessionId: chat.sessionId,
                node
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

    static async node(req: Request, res: Response) {

        try {

            const { chatId, optionId } = req.body;

            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }

            const currentNode = chat.currentNode || "main-menu";

            const node = NodeService.getNode(currentNode);

            if (!node) {
                return res.status(400).json({
                    success: false,
                    message: "Node not found"
                });
            }

            const option = node.options.find(
                (o: any) => o.id === optionId
            );

            if (!option) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid option"
                });
            }

            const nextNodeId = option.next;

            if (!nextNodeId) {
                return res.json({
                    success: true,
                    node: {
                        id: currentNode,
                        title: "End",
                        message: "No further steps.",
                        options: []
                    }
                });
            }

            const nextNode = NodeService.getNode(nextNodeId);

            if (!nextNode) {
                return res.status(400).json({
                    success: false,
                    message: `Node '${nextNodeId}' not found`
                });
            }

            chat.currentNode = nextNode.id;
            await chat.save();

            return res.json({
                success: true,
                node: nextNode
            });

        } catch (error) {

            console.error("MENU_ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}



