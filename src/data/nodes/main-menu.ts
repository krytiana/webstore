//src/data/nodes/main-menu.ts
import { Node } from "../../types/nodesTypes";

export const mainNode: Node = {
    id: "main-menu",
    type: "menu",

    title: "Welcome to CodeCartHub",
    message: "How can I help you today?",

    options: [
        {
            id: "browse",
            label: "📌 Browse Ready-Made Websites",
            next: "browse-menu",
            lockNode: true,
            tag: "browse"
        },
        {
            id: "custom",
            label: "📌 Build a Custom Website",
            next: "custom-menu",
            lockNode: true,
            tag: "lead_required"
        },
        {
            id: "company",
            label: "📌 Ask About CodeCartHub",
            next: "company-menu",
            tag: "info"
        },
        {
            id: "support",
            label: "📌 Need Guidelines",
            next: "support-menu",
            tag: "support"
        }
    ]
};