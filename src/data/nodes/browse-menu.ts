import { Node } from "../../types/nodesTypes";

export const browseNode: Node = {
    id: "browse-menu",
    type: "menu",

    title: "Browse Website Templates",

    message: "Choose one option below.",

    options: [
        {
            id: "help_choose",
            label: "Help me choose a website",
            next: "business-selector"
        },
        {
            id: "know_template",
            label: "Learn about a specific template",
            next: "template-search"
        }
    ]
};

export const helpChoose: Node = {
    id: "business-selector",
    type: "menu",
    title: "Help Me Choose",
    message: "What kind of website are you looking to build?",
    options: [
        {
            id: "ecommerce",
            label: "E-commerce Website",
            next: "ecommerce-results"
        },
        {
            id: "portfolio",
            label: "Portfolio Website",
            next: "portfolio-results"
        },
        {
            id: "blog",
            label: "Blog Website",
            next: "blog-results"
        },
        {
            id: "management-system",
            label: "Management System Website like a HMS, CRM, or ERP",
            next: "management-system-results"
        },
        {
            id: "service",
            label: "Service Website like a restaurant, salon, or gym",
            next: "service-results"
        }
    ]
};

export const ecommerceResultsNode: Node = {
    id: "ecommerce-results",
    type: "action",
    action: "findTemplates",
    category: "ecommerce"
};