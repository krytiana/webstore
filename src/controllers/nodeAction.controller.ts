//src/controllers/nodeAction.controller.ts
import { Response } from "express";

import { Node } from "../types/nodesTypes";
import { ActionService } from "../services/ActionService";

export class NodeActionController {

    static async execute(
        node: Node,
        chat: any,
        res: Response
    ) {

        try {

            const result = await ActionService.execute(
                node,
                chat
            );

            return res.json(result);

        } catch (error) {

            console.error("NODE_ACTION_ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to execute node action."
            });

        }

    }

    static async executeInput(
        action: string,
        value: string,
        chat: any,
        res: Response
    ) {

        try {

            const result = await ActionService.executeInput(
                action,
                value,
                chat
            );

            // Input handled, clear pending action
            chat.pendingAction = null;
            await chat.save();

            return res.json(result);

        } catch (error) {

            console.error("INPUT_ACTION_ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to execute input action."
            });

        }

    }

}