import { Node } from "../../types/nodesTypes";

export const supportNode: Node = {
    id: "support-menu",
    type: "menu",

    title: "Guidelines & Support",

    message: "Choose a topic.",

    options: [
        {
            id: "deployment",
            label: "Deployment Guide"
        },
        {
            id: "installation",
            label: "Installation Guide"
        },
        {
            id: "github",
            label: "GitHub Guide"
        }
    ]
};