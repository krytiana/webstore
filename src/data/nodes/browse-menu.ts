//src/data/nodes/browse-menu.ts
import { Node } from "../../types/nodesTypes";

export const browseNode: Node = {
    id: "browse-menu",
    type: "menu",

    title: "Browse Website Templates",

    message: "How would you like to browse our ready-made website templates? Choose one of the options below to get started.",

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

// Nodes for the "Help me choose a website" option
export const helpChoose: Node = {
    id: "business-selector",
    type: "menu",
    title: "Help Me Choose",
    message: "I'm glad to help you choose a website template. Please select the type of website you want to create from the options below.",
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
    category: "E-commerce",
};

export const portfolioResultsNode: Node = {
    id: "portfolio-results",
    type: "action",
    action: "findTemplates",
    category: "Portfolio",
};

export const blogResultsNode: Node = {
    id: "blog-results",
    type: "action",
    action: "findTemplates",
    category: "Blog",
};

export const managementSystemResultsNode: Node = {
    id: "management-system-results",
    type: "action",
    action: "findTemplates",
    category: "Management System",
};

export const serviceResultsNode: Node = {
    id: "service-results",
    type: "action",
    action: "findTemplates",
    category: "Service",
};

// Nodes for the "Learn about a specific template" option
export const templateOptionsNode: Node = {
    id: "template-options",
    type: "menu",
    title: "",
    message: "What would you like to know about this template?",
    options: [
        {
            id: "overview",
            label: "🌟 Product Overview",
            next: "template-overview"
        },
        {
            id: "live-demo",
            label: "🌐 Live Demo",
            next: "template-live-demo"
        },
        {
            id: "features",
            label: "📦 What is Included",
            next: "template-features"
        },
        {
            id: "tech-stack",
            label: "🛠 Tech Stack & Best For",
            next: "template-tech-stack"
        },

        {
            id: "ask-ai",
            label: "❓ Ask About This Template",
            next: "template-ai"
        }
    ]
};

export const templateSearchNode: Node = { //for input node to search for a specific template by name
    id: "template-search",
    type: "input",

    title: "Find a Template",

    message:
        "Please enter the name of the template you want to learn about. Type it same as it appears on the product page.",

    action: "findTemplateByName"
};

export const templateOverview: Node = {
    id: "template-overview",
    type: "action",
    action: "templateOverview"
};

export const templateLiveDemo: Node = {
    id: "template-live-demo",
    type: "action",
    action: "templateLiveDemo"
};

export const templateFeatures: Node = {
    id: "template-features",
    type: "action",
    action: "templateFeatures"
};

export const templateTechStack: Node = {
    id: "template-tech-stack",
    type: "action",
    action: "templateTechStack"
};

export const templatePricing: Node = {
    id: "template-pricing",
    type: "action",
    action: "templatePricing"
};