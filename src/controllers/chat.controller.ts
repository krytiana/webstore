//src/controllers/chat.controller.ts
import { Request, Response } from "express";

import { NodeService } from "../services/NodeService";
import { ActionService } from "../services/ActionService";
import { ConsultationAIService } from "../services/ai/consultation-ai.service";
import { DeploymentAIService } from "../services/ai/deployment-ai.service";
import { ConversationService } from "../services/conversation.service";


export class ChatController {

    static renderChat(req: Request, res: Response): void {
        res.render("chat");
    }

    static async newChat(req: Request, res: Response) {

        try {

            const node = NodeService.getNode("main-menu");

            ConversationService.start(req, "consultation");
            ConversationService.setCurrentNode(req, "main-menu");

            if (!node) {
                return res.status(500).json({
                    success:false,
                    message:"Main menu not found."
                });
            }

            return res.json({
                success:true,
                node
            });

        } catch(error) {

            console.error("NEW_CHAT_ERROR:", error);

            return res.status(500).json({
                success:false,
                message:"Failed to start chat"
            });

        }

    }

    static async sendMessage(req: Request, res: Response) {

        try {

            const { message, aiMode } = req.body;

            // Consultation AI
            if (aiMode === "consultation") {

        const reply = await ConsultationAIService.reply(
            req,
            message
        );

            return res.json({
                success: true,
                message: reply
            });
        }

        if (aiMode === "deployment") {

            const { aiAction } = req.body;

            const reply = await DeploymentAIService.reply(
                req,
                aiAction,
                message
            );

            return res.json({
                success: true,
                message: reply
            });
        }

                // Menu chat
                const pendingAction =
                    ConversationService.getPendingAction(req);

                if (pendingAction) {

                    const result = await ActionService.executeInput(
                    req,
                    pendingAction,
                    message
                );

                    ConversationService.setPendingAction(req, null);

                    return res.json(result);
                }

                // No free-text expected here
                return res.status(400).json({
                    success:false,
                    message:"Please choose one of the available options."
                });

            } catch (error) {

                console.error(error);

                return res.status(500).json({
                    success:false,
                    message:"Internal server error."
                });

            }

    }

    static async node(req: Request, res: Response) {
        
        try {

            const { optionId } = req.body;

            const currentNode =
                ConversationService.getCurrentNode(req);

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
            if (lockNode) {
                ConversationService.lockNode(req, currentNode);
            }

            // 2. FLOW TAG
            if (tag === "lead_required") {
                ConversationService.setFlow(req, "custom");
            }

            // 3. MOVE TO NEXT NODE
            if (next) {
                ConversationService.setCurrentNode(req, next);
            }

            // Clear any previous pending action
            ConversationService.setPendingAction(req, null);

            // 4. LOAD NEXT NODE
            const nextNode = next
                ? NodeService.getNode(next)
                : null;

            if (!nextNode) {

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

                ConversationService.setPendingAction(
                    req,
                    nextNode.action || null
                );

                return res.json({
                    success: true,
                    node: nextNode
                });

            }

            // 7. ACTION NODE
            if (nextNode.type === "action") {

                const result = await ActionService.execute(
                req,
                nextNode
            );
            

                return res.json(result);

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



