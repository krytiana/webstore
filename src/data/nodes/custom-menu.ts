//src/data/nodes/custom-menu.ts
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
            next: "custom-consultation"
        },
        {
            id: "renovate",
            label: "Renovate an existing website",
            next: "template-search"
        }
    ]
};


export const customConsultationNode: Node = {
    id: "custom-consultation",
    type: "action",
    action: "customConsultation"
};

