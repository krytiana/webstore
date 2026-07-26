//src/prompts/deployment.prompt.ts

export const deploymentPrompts = {

    renderAccountCreation: {
        title: "Render Account Creation",

        objective:
            "Help the customer successfully create a Render account.",

        description:
            "Creating a Render account before deployment begins.",

        requiredInformation: [
            "Sign-up page URL",
            "Browser being used",
            "Any error message displayed"
        ],

        diagnosticQuestions: [
            "What happens when you open the Render sign-up page?",
            "Do you see an error message or does the page fail to load?",
            "Can you share the URL you're trying to open?"
        ],

        

        commonMistakes: [
            "Broken deployment guide link",
            "Incorrect Render URL",
            "Browser cache issue",
            "Network connectivity problem"
        ],
        conversationGoal:
        "Help the customer create a Render account successfully.",
    },

    newWebServiceCreation: {
        title: "Render Web Service",

        objective:
            "Create a new Web Service from the customer's GitHub repository.",

        description:
            "Creating a new Render Web Service.",

        requiredInformation: [
            "Repository connected",
            "Repository visibility",
            "Selected branch"
        ],

        diagnosticQuestions: [
            "Can you see your repository in Render?",
            "Which branch are you deploying?",
            "What error do you see?"
        ],

        commonMistakes: [
            "GitHub not connected",
            "Wrong repository selected",
            "Wrong deployment branch"
        ],
        conversationGoal:
        "Help the customer successfully create a Render Web Service.",
    },

    selectingGithubRepository: {
        title: "Selecting GitHub Repository",

        objective:
            "Select the correct GitHub repository for deployment.",

        description:
            "Selecting the correct GitHub repository in Render.",

        requiredInformation: [
            "Repository name",
            "GitHub account",
            "Repository visibility"
        ],

        diagnosticQuestions: [
            "Can you see your repository listed?",
            "Is the repository public or private?",
            "What happens after selecting it?"
        ],

        commonMistakes: [
            "Wrong GitHub account",
            "Repository not uploaded",
            "GitHub authorization missing"
        ],
        conversationGoal:
        "Help the customer successfully connect the correct GitHub repository.",
    },

    configuringBuildSettings: {
        title: "Build Settings",

        objective:
            "Configure Render so the application builds and starts successfully.",

        description:
            "Configuring Render build settings.",

        requiredInformation: [
            "Build Command",
            "Start Command",
            "Root Directory",
            "Node Version",
            "Build Log"
        ],

        diagnosticQuestions: [
            "What error message are you seeing?",
            "Did the build fail or did deployment fail after building?",
            "Can you paste the Render build log?"
        ],

        commonMistakes: [
            "Incorrect Build Command",
            "Incorrect Start Command",
            "Wrong Root Directory",
            "Missing package.json",
            "Unsupported Node version",
            "Missing dependencies"
        ],
        conversationGoal:
            "Identify the exact deployment issue before recommending a fix."
            },

    mongodbAccountSetup: {
        title: "MongoDB Atlas Setup",

        objective:
            "Create a MongoDB Atlas database and obtain a valid connection string.",

        description:
            "Creating a MongoDB Atlas database.",

        requiredInformation: [
            "Cluster created",
            "Database user",
            "Connection string"
        ],

        diagnosticQuestions: [
            "Which step are you currently on?",
            "Are you receiving an Atlas error?",
            "Have you copied your connection string?"
        ],

        commonMistakes: [
            "Database user not created",
            "IP whitelist missing",
            "Wrong connection string",
            "Password contains unsupported characters"
        ],
        conversationGoal:
        "Help the customer successfully create and connect a MongoDB Atlas database.",
    },

    renderEnvironmentVariables: {
        title: "Environment Variables",

        objective:
            "Configure all required environment variables before deployment.",

        description:
            "Adding environment variables in Render.",

        requiredInformation: [
            "Variable name",
            "Variable value",
            "Deployment environment"
        ],

        diagnosticQuestions: [
            "Which environment variable is causing the problem?",
            "What error message are you receiving?",
            "Does the application fail during build or runtime?"
        ],

        commonMistakes: [
            "Missing environment variable",
            "Incorrect variable name",
            "Incorrect variable value",
            "Forgot to redeploy after changes"
        ],
        conversationGoal:
        "Help the customer correctly configure all required environment variables.",
    }

} as const;

export class DeploymentPromptService {

    static build(action: string) {

        const step = deploymentPrompts[action as keyof typeof deploymentPrompts];

        if (!step) {
            throw new Error(`Unknown deployment action: ${action}`);
        }

return `
You are CodeCartHub's Deployment Support Engineer.

Current stage:
${step.title}

Current task:
${step.description}

Help the customer complete this deployment step.

If the issue belongs to another deployment stage, continue helping from that stage naturally.

Before responding:

• Understand the customer's goal.
• Build on information already provided.
• If enough information is available, provide the solution.
• Otherwise ask ONE useful question.

When providing a solution:

• verify the information
• explain the issue briefly
• show the correct format if needed
• explain where to perform the action when applicable
• explain how to complete it
• explain the next step

When the customer asks where to find a feature, page or button:

• Answer with navigation steps first.
• Only ask for more information if the customer still cannot find it.

If a deployment guide or link returns 404, consider that the guide may be incorrect before assuming user error.

Never invent UI paths, settings, logs or errors.

If unsure about interface navigation, say "look for" instead of naming menus.

Stay focused on deployment support.
`.trim();

    }

}