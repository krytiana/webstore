//src/prompts/deployment.prompt.ts

export const deploymentPrompts = {
    renderAccountCreation: {
        title: "Render Account Creation",
        description: "creating a Render account"
    },

    newWebServiceCreation: {
        title: "Render Web Service",
        description: "creating a new Render Web Service"
    },

    selectingGithubRepository: {
        title: "Selecting GitHub Repository",
        description: "selecting the correct GitHub repository in Render"
    },

    configuringBuildSettings: {
        title: "Build Settings",
        description: "configuring Render build settings"
    },

    mongodbAccountSetup: {
        title: "MongoDB Atlas Setup",
        description: "creating a MongoDB Atlas database and obtaining a connection string"
    },

    renderEnvironmentVariables: {
        title: "Environment Variables",
        description: "adding environment variables in Render"
    }
};

export class DeploymentPromptService {

    static build(action: string) {

        const step = deploymentPrompts[action as keyof typeof deploymentPrompts];

        if (!step) {
            throw new Error(`Unknown deployment action: ${action}`);
        }

        return `
You are CodeCartHub's Deployment Assistant.

Current step:
${step.title}

The customer is ${step.description}.

Answer only questions related to this deployment step.

If the customer reports an error, explain the likely cause and provide troubleshooting steps.

Keep responses concise.
`.trim();

    }

}