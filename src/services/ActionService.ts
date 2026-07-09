import { Node } from "../types/nodesTypes";

import { TemplateAction } from "../actions/template.action";

export class ActionService {

    static async execute(
        node: Node,
        chat: any
    ) {

        switch (node.action) {

            case "findTemplates":

                return await TemplateAction.findTemplates(
                    node,
                    chat
                );

            default:

                return {
                    success: false,
                    message: `Unknown action '${node.action}'.`
                };

        }

    }

}