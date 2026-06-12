import { Request, Response } from "express";
import crypto from "crypto";

import Chat from "../models/Chat.model";
import { AIService } from "../services/ai.service";

export class ChatController {

    static renderChat(
        req: Request,
        res: Response
    ): void {

        res.render("chat");
    }

    static async newChat(
        req: Request,
        res: Response
    ) {

        try {

            const welcomeMessage = `
Hello 👋

Welcome! I'm your project consultant.

Tell me about your business and what you'd like to build.
`;

            const chat = await Chat.create({

                sessionId: crypto.randomUUID(),

                messages: [
                    {
                        role: "assistant",
                        content: welcomeMessage
                    }
                ]

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

    static async sendMessage(
        req: Request,
        res: Response
    ) {

        try {

            const { chatId, message } = req.body;

            const chat = await Chat.findById(chatId);

            if (!chat) {

                return res.status(404).json({

                    success: false,

                    message: "Chat not found"

                });

            }

            chat.messages.push({

                role: "user",

                content: message

            });

            const aiResponse =
                await AIService.generateResponse(
                    chat.messages
                );

            chat.messages.push({

                role: "assistant",

                content: aiResponse

            });

            await chat.save();

            return res.json({

                success: true,

                message: aiResponse

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