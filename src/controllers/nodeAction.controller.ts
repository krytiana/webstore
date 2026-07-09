import { Response } from "express";

import Chat from "../models/Chat.model";
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

}