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

    message: "What type of website would you like to build?",

    options: [
        {
            id: "business",
            label: "Business Website",
            next: "custom-consultation",

            data:{
                websiteType:"Business Website"
            }
        },
        {
            id: "ecommerce",
            label: "Online Store",
            next: "custom-consultation",

            data:{
                websiteType:"Ecommerce Website"
            }
        },
        {
            id: "portfolio",
            label: "Portfolio",
            next: "custom-consultation",

            data:{
                websiteType:"Portfolio Website"
            }
        },
        {
            id: "blog",
            label: "Blog / News",
            next: "custom-consultation",

            data:{
                websiteType:"Blog / News Website"
            }
        },
        {
            id: "management",
            label: "Management System",
            next: "custom-consultation",

            data:{
                websiteType:"Management System"
            }
        },
        {
            id: "other",
            label: "Something Else",
            next: "custom-consultation",

            data:{
                websiteType:"Something Else"
            }
        }
    ]
};

export const customConsultationNode: Node = {
    id: "custom-consultation",
    type: "action",
    action: "customConsultation"
};

