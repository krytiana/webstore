//src/services/AIPromptService.ts
export class AIPromptService {

    static async build(
        mode?: string,
        action?: string
    ): Promise<string | undefined> {

        switch (mode) {

            case "deployment": {

                const { DeploymentPromptService } =
                    await import("../prompts/deployment.prompt");

                return DeploymentPromptService.build(action!);

            }

            case "consultation": {

                const { ConsultantPromptService } =
                    await import("../prompts/consultant.prompt");

                return ConsultantPromptService.build();

            }

            default:
                return undefined;

        }

    }

}