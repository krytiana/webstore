import { Node } from "../../types/nodesTypes";

export const customNode: Node = {
    id: "custom-menu",
    type: "menu",

    title: "Custom Website",

    message: "Tell us what you'd like to build.",

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