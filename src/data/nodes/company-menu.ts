import { Node } from "../../types/nodesTypes";

export const companyNode: Node = {
    id: "company-menu",
    type: "menu",

    title: "About CodeCartHub",

    message: "What would you like to know?",

    options: [
        {
            id: "about",
            label: "About CodeCartHub"
        },
        {
            id: "pricing",
            label: "Pricing & Licensing"
        },
        {
            id: "contact",
            label: "Contact Information"
        }
    ]
};