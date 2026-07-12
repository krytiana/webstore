//services/ActionService.ts
import { Node } from "../types/nodesTypes";

import { TemplateAction, } from "../actions/template.action";

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

            case "templateLiveDemo":
                return await TemplateAction.liveDemo(chat);

            case "templateFeatures":
                return await TemplateAction.features(chat);

            case "templateTechStack":
                return await TemplateAction.techStack(chat);

            case "templatePricing":
                return await TemplateAction.pricing(chat);
            
            case "templateOverview":
                return await TemplateAction.overview(chat);

            default:

                return {
                    success: false,
                    message: `Unknown action '${node.action}'.`
                };

        }

    }

    static async executeInput(
        action: string,
        value: string,
        chat: any
    ) {

        switch (action) {

            case "findTemplateByName":

                return await TemplateAction.findTemplateByName(
                    value,
                    chat
                );

            default:

                return {
                    success: false,
                    message: `Unknown input action '${action}'.`
                };

        }

    }

}

