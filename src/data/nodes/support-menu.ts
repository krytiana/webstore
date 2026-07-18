//src/data/nodes/support-menu.ts
import { Node } from "../../types/nodesTypes";

export const guidelinesNode: Node = {
    id: "guidelines-menu",
    type: "menu",

    title: "Guidelines & Support",

    message: "Choose a topic.",

    options: [
        {
            id: "github-connection",
            label: "GitHub Connection Guide",
            next: "github-connection-guide"
        },
        {
            id: "repository-creation",
            label: "Repository Creation Guide",
            next: "repository-creation-guide"
        },
        {
            id: "source-code-uploading",
            label: "Source Code Uploading Guide",
            next: "source-code-uploading-guide"
        },
        {
            id: "deployment-guide",
            label: "Deployment Guide",
            next: "deployment-step-menu"
        }
    ]
};

export const gitHubConnectionNode: Node = {
    id: "github-connection-guide",
    type: "info",
    title: "GitHub Connection Guide",
    message: "To use our deployment features, you need to connect your GitHub account. Follow these steps:|1. Sign in to your GitHub account or create one.|2. once you're signed in to GitHub, return to Code CartHub deployment guide page and click 'Connect'.|3. Authorize Code CartHub to access your GitHub account. This will allow us to create repositories and manage your code for deployment.|4. After authorization, you should see a confirmation message indicating that your GitHub account is connected.",
    options: [
        {
            id: "proceed-to-repository-creation",
            label: "Proceed to Repository Creation -->",
            next: "repository-creation-guide"
        },
        {
            id: "back-to-guidelines",
            label: "<-- Back to Guidelines",
            next: "guidelines-menu"
        },
        
    ]
};

export const repositoryCreationNode: Node = {
    id: "repository-creation-guide",
    type: "info",
    title: "Repository Creation Guide",
    message: "To deploy your website, you need a repository to contain your template source code.|Code CartHub will automatically fill a repository name.|You can modify the name if needed. click 'Create Repository' to proceed.|Code CartHub will create the repository for you on GitHub.",
    options: [
        {
            id: "proceed-to-source-code-uploading",
            label: "Proceed to Source Code Uploading -->",
            next: "source-code-uploading-guide"
        },
        {
            id: "back-to-guidelines",
            label: "<-- Back to Guidelines",
            next: "guidelines-menu"
        }
    ]
};

export const sourceCodeUploadingNode: Node = {
    id: "source-code-uploading-guide",
    type: "info",
    title: "Source Code Uploading Guide",
    message: "After creating the repository, you need to upload your template source code.|Code CartHub will automatically upload the source code to the repository.|You can monitor the progress and check for any errors during the upload process.|once these steps are completed, you can proceed to deploy your website using the deployment guide.",
    options: [
        {
            id: "proceed-to-deployment-guide",
            label: "Proceed to Deployment Guide -->",
            next: "deployment-step-menu"
        },
        {
            id: "back-to-guidelines",
            label: "<-- Back to Guidelines",
            next: "guidelines-menu"
        }
    ]
};

// Deployment Menu Nodes
export const deploymentMenuNode: Node = {
    id: "deployment-step-menu",
    type: "menu",
    title: "Deployment Help",
    message: "Choose the deployment step you need help with.",
    options: [
        {
            id: "render-account",
            label: "Create a Render Account",
            next: "render-account-creation"
        },
        {
            id: "new-web-service",
            label: "Creating New Web Service on Render",
            next: "new-web-service-creation"
        },
        {
            id: "selecting-repository",
            label: "Selecting Your Repository on Render",
            next: "selecting-github-repository"
        },
        {
            id: "build-settings",
            label: "Configure Build Settings on Render",
            next: "configuring-build-settings"
        },
        {
            id: "mongodb-setup",
            label: "Creating MongoDB Account and Database",
            next: "mongodb-account-setup"
        },
        {
            id: "environment-variables",
            label: "Environment Variables Setup on Render",
            next: "render-environment-variables"
        }
    ]
};

export const renderAccountCreationNode: Node = {
    id: "render-account-creation",
    type: "action",
    action: "renderAccountCreation"
};

export const newWebServiceCreationNode: Node = {
    id: "new-web-service-creation",
    type: "action",
    action: "newWebServiceCreation"
};

export const selectingGithubRepositoryNode: Node = {
    id: "selecting-github-repository",
    type: "action",
    action: "selectingGithubRepository"
};

export const configuringBuildSettingsNode: Node = {
    id: "configuring-build-settings",
    type: "action",
    action: "configuringBuildSettings"
};

export const mongodbAccountSetupNode: Node = {
    id: "mongodb-account-setup",
    type: "action",
    action: "mongodbAccountSetup"
};

export const renderEnvironmentVariablesNode: Node = {
    id: "render-environment-variables",
    type: "action",
    action: "renderEnvironmentVariables"
};
