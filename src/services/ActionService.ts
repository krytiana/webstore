//services/ActionService.ts
import { Request } from "express";
import { Node } from "../types/nodesTypes";

import { TemplateAction, } from "../actions/template.action";
import { DeploymentAIService } from "./ai/deployment-ai.service";
import { ConsultationAIService } from "./ai/consultation-ai.service";
export class ActionService {

    static async execute(
        req: Request,
        node: Node,
       
        
    ) {

        switch (node.action) {

            // =========================
            // Template Actions
            // =========================

            case "findTemplates":

                return await TemplateAction.findTemplates(
                    node
                    
                  
                );

            case "templateLiveDemo":
                return await TemplateAction.liveDemo(req);

            case "templateFeatures":
                return await TemplateAction.features(req);

            case "templateTechStack":
                return await TemplateAction.techStack(req);

            case "templatePricing":
                return await TemplateAction.pricing(req);

            case "templateOverview":
                return await TemplateAction.overview(req);

            case "customConsultation":
                return await ConsultationAIService.start(req);
            // =========================
            // Deployment AI Actions
            // =========================

            case "renderAccountCreation":
            case "newWebServiceCreation":
            case "selectingGithubRepository":
            case "configuringBuildSettings":
            case "mongodbAccountSetup":
            case "renderEnvironmentVariables":

            return await DeploymentAIService.start(
                req,
                node.action
            );


            default:

                return {
                    success: false,
                    message: `Unknown action '${node.action}'.`
                };

        }

    }

    static async executeInput(
        req: Request,
        action: string,
        value: string
    ) {

        switch (action) {

            case "findTemplateByName":

                return await TemplateAction.findTemplateByName(
                req,
                value
            );

            default:

                return {
                    success: false,
                    message: `Unknown input action '${action}'.`
                };

        }

    }

}





