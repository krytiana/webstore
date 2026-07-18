//src/actions/deployment.action.ts
import { AIService } from "../services/ai.service";
import { DeploymentPromptService } from "../prompts/deployment.prompt";

export class DeploymentAction {

    static async start(
        action: string,
        chat: any
    ) {

        const prompt =
            DeploymentPromptService.build(action);
            

        const reply = await AIService.generateResponse(
            
            chat.messages,
            "Start the deployment support conversation.",
            {
                systemPrompt: prompt,
                includeProducts: false
            }
        );
        console.log("DEPLOYMENT AI REPLY:", reply);
        return {
            success: true,
            action: "ai",
            message: reply
        };

    }

}