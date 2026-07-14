import { Node } from "../../types/nodesTypes";

export const customNode: Node = {
    id: "custom-menu",
    type: "menu",

    title: "Custom Website",

    message: "I'm glad to help you build your website. How would you like to proceed?",

    options: [
        {
            id: "new_project",
            label: "Start a new custom website",
            next: "custom-project"
        },
        {
            id: "renovate",
            label: "Renovate an existing website",
            next: "website-renovation"
        }
    ]
};

//nodes for the "Start a new custom website" option
export const customProjectNode: Node = {
    id: "custom-project",
    type: "menu",
    title: "Start a New Custom Website",
    message: "Let's get started with your new custom website. Give details about your project, and I'll assist you in creating a tailored solution.",
    options: [
        
    ]
};