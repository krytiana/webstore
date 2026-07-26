//src/controllers/chat.controller.ts
import { Request, Response } from "express";
import crypto from "crypto";

import Chat from "../models/Chat.model";
import { AIService } from "../services/ai.service";
import { LeadService } from "../services/lead.service";
import { NodeService } from "../services/NodeService";
import { NodeActionController } from "./nodeAction.controller";
import { AIPromptService } from "../services/AIPromptService";

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

            const { chatId, message, aiMode, aiAction } = req.body;

            console.log({aiMode, aiAction});


            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }

            // Save user message
            chat.messages.push({
                role: "user",
                content: message
            });

            /*
            |--------------------------------------------------------------------------
            | INPUT ACTIONS (No AI)
            |--------------------------------------------------------------------------
            */

            if (chat.pendingAction) {

                await chat.save();

                return await NodeActionController.executeInput(
                    chat.pendingAction,
                    message,
                    chat,
                    res
                );

            }

            /*
            |--------------------------------------------------------------------------
            | AI FALLBACK
            |--------------------------------------------------------------------------
            */

            const systemPrompt = await AIPromptService.build(
                aiMode,
                aiAction
            );

            const aiResponse = await AIService.generateResponse(
                chat.messages,
                message,
                {
                    systemPrompt,
                    includeProducts: !systemPrompt
                }
            );

            const cleanedResponse = aiResponse
                .replace(/\[LEAD_DATA\][\s\S]*?\[\/LEAD_DATA\]/, "")
                .trim();

            const leadMatch = aiResponse.match(
                /\[LEAD_DATA\]([\s\S]*?)\[\/LEAD_DATA\]/
            );

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

            const result = NodeService.handleOption(
                currentNode,
                optionId
            );



            if (!result) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid option"
                });
            }

            const { next, lockNode, tag, data } = result;

            // 1. LOCK NODE
            if (lockNode && !chat.lockedNodes?.includes(currentNode)) {
                chat.lockedNodes = chat.lockedNodes || [];
                chat.lockedNodes.push(currentNode);
            }

            // 2. FLOW TAG
            if (tag === "lead_required") {
                chat.flow = "custom";
            }

            // 3. MOVE TO NEXT NODE
            if (next) {
                chat.currentNode = next;
            }

            // Clear any previous pending action
            chat.pendingAction = null;

            // 4. LOAD NEXT NODE
            const nextNode = next
                ? NodeService.getNode(next)
                : null;

            if (!nextNode) {

                await chat.save();

                return res.json({
                    success: true,
                    node: {
                        id: currentNode,
                        type: "end",
                        title: "End",
                        message: "No further steps.",
                        options: []
                    }
                });

            }

            // 5. INPUT NODE (wait for user text)
            if (nextNode.type === "input") {

                chat.pendingAction = nextNode.action;
                await chat.save();

                return res.json({
                    success: true,
                    node: nextNode
                });

            }

            // 6. SAVE CHAT BEFORE CONTINUING
            await chat.save();

            // 7. ACTION NODE
            if (nextNode.type === "action") {

                return await NodeActionController.execute(
                    nextNode,
                    chat,
                    res,
                    data
                );

            }

            // 8. NORMAL MENU NODE
            return res.json({
                success: true,
                node: nextNode
            });

        } catch (error) {

            console.error("NODE_ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });

        }
    }
    
}



