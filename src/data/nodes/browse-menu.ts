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

// Nodes for the "Help me choose a website" option
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
    message: "What would you like to know?",
    options: [
        {
            id: "live-demo",
            label: "🌐 Live Demo",
            next: "template-live-demo"
        },
        {
            id: "features",
            label: "✨ Features",
            next: "template-features"
        },
        {
            id: "tech-stack",
            label: "🛠 Tech Stack",
            next: "template-tech-stack"
        },
        {
            id: "pricing",
            label: "💰 Pricing",
            next: "template-pricing"
        },
        {
            id: "customization",
            label: "🎨 Customization Options",
            next: "template-customization"
        },
        {
            id: "admin-dashboard",
            label: "⚙ Admin Dashboard",
            next: "template-admin-dashboard"
        },
        {
            id: "deployment",
            label: "🚀 Deployment Guide",
            next: "template-deployment"
        },
        {
            id: "compare",
            label: "🔄 Compare with Another Template",
            next: "template-compare"
        }
    ]
};

export const templateSearchNode: Node = { //for input node to search for a specific template by name
    id: "template-search",
    type: "input",

    title: "Find a Template",

    message:
        "Enter the template name you're looking for.",

    action: "findTemplateByName"
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