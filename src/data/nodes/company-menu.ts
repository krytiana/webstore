import { Node } from "../../types/nodesTypes";

export const companyNode: Node = {
    id: "company-menu",
    type: "menu",

    title: "CodeCartHub Documentation",

    message: "What would you like to know?",

    options: [
        {
            id: "company-info",
            label: "Company Information",
            next: "company-information-menu"
        },
        {
            id: "pricing",
            label: "Pricing Policy",
            next: "pricing-menu"
        },
        {
            id: "support",
            label: "Support Policy",
            next: "support-menu"
        },
        {
            id: "demo",
            label: "Live Demo",
            next: "demo-menu"
        },
        {
            id: "deployment",
            label: "Deployment workflow",
            next: "deployment-menu"
        }
        
    ]
};

export const companyInformationNode: Node = {
    id: "company-information-menu",
    type: "menu",
    title: "Company Information",
    message: "Learn more about our company and its mission.",
    options: [
        {
            id: "about",
            label: "About CodeCartHub",
            next: "about-node"
        },
        {
            id: "offer",
            label: "What We Offer",
            next: "offer-node"
        },
        {
            id: "serve",
            label: "Who We Serve",
            next: "serve-node"
        },
        {
            id: "commitment",
            label: "Our Commitment",
            next: "commitment-node"
        }
    ]
}

export const aboutNode: Node = {
    id: "about-node",

    type: "info",

    title: "About CodeCartHub",

    message:"CodeCartHub provides professionally built, production-ready website solutions for entrepreneurs, startups, agencies, and small businesses looking to launch online quickly. Our mission is to simplify website ownership by delivering complete website systems that include frontend design, backend functionality, admin dashboards, payment integration, deployment documentation, and full source code access. Unlike traditional website builders that require recurring subscriptions, CodeCartHub products are sold through a one-time payment model, giving customers full ownership and control of their website.",
    options: [

        {
            id: "company-menu",
            label: "<-- Back to CodeCartHub Doc",
            next: "company-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        },

        
    ]

};


export const offerNode: Node = {
    id: "offer-node",
    type: "info",
    title: "What We Offer",
    message: "Every website package is designed for real-world business use and includes: | Full source code access | Responsive design | Admin dashboard | Secure authentication system | Product and content management | Database integration | Payment gateway integration | Deployment documentation | Website customization tools",
    options: [

        {
            id: "company-menu",
            label: "<-- Back to CodeCartHub Doc",
            next: "company-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        },
    ]
};

export const serveNode: Node = {
    id: "serve-node",
    type: "info",
    title: "Who We Serve",
    message:
        "CodeCartHub solutions are ideal for:|Small Businesses|Startups|Entrepreneurs|Freelancers|Agencies|Online Stores|Service Providers",
        options: [
 
        {
            id: "company-menu",
            label: "<-- Back to CodeCartHub Doc",
            next: "company-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        },
    ]
};

export const commitmentNode: Node = {
    id: "commitment-node",
    type: "info",
    title: "Our Commitment",
    message: "We focus on delivering websites that are easy to deploy, easy to manage, and easy to customize. Customers receive complete ownership of their purchase and the flexibility to modify their website as their business grows. |Our goal is to help businesses launch faster without sacrificing quality, functionality, or scalability.",
    options: [

    {
        id: "company-menu",
        label: "<-- Back to CodeCartHub Doc",
        next: "company-menu"
    },
    {
        id: "main-menu",
        label: "<-- Back to Main Menu",
        next: "main-menu"
    },
]
        
};   

export const pricingMenuNode: Node = {
    id: "pricing-menu",
    type: "menu",

    title: "Pricing Policy",

    message: "Choose a pricing topic.",

    options: [
        {
            id: "pricing-structure",
            label: "Pricing Structure",
            next: "pricing-structure-node"
        },
        {
            id: "available-plans",
            label: "Available Plans",
            next: "available-plans-menu"
        },
        {
            id: "payment-processing",
            label: "Payment Processing",
            next: "payment-processing-node"
        },
        {
            id: "additional-services",
            label: "Additional Services",
            next: "additional-services-node"
        },
        {
            id: "pricing-updates",
            label: "Pricing Updates",
            next: "pricing-updates-node"
        }
    ]
};

export const pricingStructureNode: Node = {
    id: "pricing-structure-node",
    type: "info",

    title: "Pricing Structure",

    message:
        "All CodeCartHub products are sold using a one-time payment model. Customers purchase the website package once and receive lifetime access to the source code and included documentation. No recurring subscription fees are required to use the purchased website.",

    options: [
        {
            id: "pricing-menu",
            label: "<-- Back to Pricing Policy",
            next: "pricing-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const availablePlansMenu: Node = {
    id: "available-plans-menu",
    type: "menu",

    title: "Available Plans",

    message: "Choose a plan to learn what's included.",

    options: [
        {
            id: "basic-plan",
            label: "Basic Plan",
            next: "basic-plan-node"
        },
        {
            id: "assisted-plan",
            label: "Assisted Plan",
            next: "assisted-plan-node"
        },
        {
            id: "done-plan",
            label: "Done For You Plan",
            next: "done-plan-node"
        }
    ]
};

export const basicPlanNode: Node = {
    id: "basic-plan-node",
    type: "info",

    title: "Basic Plan",

    message:
        "Includes:|Full source code|Setup guide|Project documentation|Lifetime access|Does Not Include:|Installation assistance|Deployment assistance|Technical support",

    options: [
        {
            id: "available-plans-menu",
            label: "<-- Back to Available Plans",
            next: "available-plans-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const assistedPlanNode: Node = {
    id: "assisted-plan-node",
    type: "info",

    title: "Assisted Plan",

    message:
        "Includes everything in the Basic Plan, plus:|Step-by-step setup assistance|Email support|Priority response times|Deployment guidance",

    options: [
        {
            id: "available-plans-menu",
            label: "<-- Back to Available Plans",
            next: "available-plans-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const donePlanNode: Node = {
    id: "done-plan-node",
    type: "info",

    title: "Done For You Plan",

    message:
        "Includes everything in the Assisted Plan, plus:|Complete installation|Environment configuration|Database setup|Payment gateway setup|Deployment assistance|Dedicated support",

    options: [
        {
            id: "available-plans-menu",
            label: "<-- Back to Available Plans",
            next: "available-plans-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const paymentProcessingNode: Node = {
    id: "payment-processing-node",
    type: "info",

    title: "Payment Processing",

    message:
        "Payments are securely processed through trusted payment providers. After successful payment, customers receive access to their purchased product and accompanying documentation.",

    options: [
        {
            id: "pricing-menu",
            label: "<-- Back to Pricing Policy",
            next: "pricing-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const additionalServicesNode: Node = {
    id: "additional-services-node",
    type: "info",

    title: "Additional Services",

    message:
        "Custom development, advanced customization, feature requests, and ongoing maintenance services may be quoted separately and are not included in standard product pricing.",

    options: [
        {
            id: "pricing-menu",
            label: "<-- Back to Pricing Policy",
            next: "pricing-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const pricingUpdatesNode: Node = {
    id: "pricing-updates-node",
    type: "info",

    title: "Pricing Updates",

    message:
        "CodeCartHub reserves the right to update pricing at any time. Price changes do not affect previously completed purchases.",

    options: [
        {
            id: "pricing-menu",
            label: "<-- Back to Pricing Policy",
            next: "pricing-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const supportMenuNode: Node = {
    id: "support-menu",
    type: "menu",

    title: "Support Policy",

    message: "Choose a support topic.",

    options: [
        {
            id: "support-overview",
            label: "Support Overview",
            next: "support-overview-node"
        },
        {
            id: "ai-support",
            label: "AI-Powered Support",
            next: "ai-support-node"
        },
        {
            id: "ai-features",
            label: "AI Consultation Features",
            next: "ai-features-node"
        },
        {
            id: "support-limitations",
            label: "Support Limitations",
            next: "support-limitations-node"
        },
        {
            id: "contact-support",
            label: "Contact Support",
            next: "contact-support-node"
        }
    ]
};

export const supportOverviewNode: Node = {
    id: "support-overview-node",
    type: "info",

    title: "Support Overview",

    message:
        "CodeCartHub provides support based on the selected purchase plan. Support is intended to assist customers with installation, deployment, product-related questions, and website solution guidance. In addition to traditional support channels, customers also have access to our AI-powered Website Consultant, available 24/7 to provide instant assistance and product recommendations.",

    options: [
        {
            id: "support-menu",
            label: "<-- Back to Support Policy",
            next: "support-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const aiSupportNode: Node = {
    id: "ai-support-node",
    type: "info",

    title: "AI-Powered Support",

    message:
        "Our AI Website Consultant is available around the clock to assist visitors and customers.|Website deployment guidance|Product and template recommendations|Feature explanations|Technical questions|Website planning assistance|Business website consultations|Product comparison and recommendations|Setup and deployment guidance|Customers can describe their business goals and project requirements, and the AI will recommend suitable website solutions. For custom website requests, the AI can generate a detailed project brief for our team.",

    options: [
        {
            id: "support-menu",
            label: "<-- Back to Support Policy",
            next: "support-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const aiFeaturesNode: Node = {
    id: "ai-features-node",
    type: "info",

    title: "AI Consultation Features",

    message:
        "Our AI Website Consultant provides:|Available 24/7|Instant responses|Business requirement analysis|Website recommendations|Custom project consultation|Automated project report generation|Product knowledge assistance",

    options: [
        {
            id: "support-menu",
            label: "<-- Back to Support Policy",
            next: "support-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const supportLimitationsNode: Node = {
    id: "support-limitations-node",
    type: "info",

    title: "Support Limitations",

    message:
        "Standard support does not include:|Custom feature development|Third-party service fees|Website content creation|Ongoing maintenance contracts|Custom integrations not included with the original product|Major design redesigns|Third-party software troubleshooting unrelated to the purchased product",

    options: [
        {
            id: "support-menu",
            label: "<-- Back to Support Policy",
            next: "support-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const contactSupportNode: Node = {
    id: "contact-support-node",
    type: "info",

    title: "Contact Support",

    message:
        "Customers may contact support using the official communication channels provided during purchase. To ensure faster assistance, please include:|Order information|Product name|Description of the issue|Screenshots or error messages when applicable|For immediate assistance, customers can also use the AI Website Consultant, available 24 hours a day, 7 days a week.",

    options: [
        {
            id: "support-menu",
            label: "<-- Back to Support Policy",
            next: "support-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const demoMenuNode: Node = {
    id: "demo-menu",
    type: "menu",

    title: "Live Demo Documentation",

    message: "Choose a topic about the live demo.",

    options: [
        {
            id: "demo-purpose",
            label: "Purpose of the Demo",
            next: "demo-purpose-node"
        },
        {
            id: "demo-included",
            label: "What's Included in the Demo",
            next: "demo-included-node"
        },
        {
            id: "demo-not-included",
            label: "What's Not Included",
            next: "demo-not-included-node"
        },
        {
            id: "purchase-included",
            label: "Included With Purchase",
            next: "purchase-included-node"
        },
        {
            id: "demo-note",
            label: "Important Note",
            next: "demo-note-node"
        }
    ]
};

export const demoPurposeNode: Node = {
    id: "demo-purpose-node",
    type: "info",

    title: "Purpose of the Demo",

    message:
        "The live demo allows customers to preview the visual design, user experience, and frontend functionality of a website before purchasing. The demo is intended to showcase the customer-facing side of the application.",

    options: [
        {
            id: "demo-menu",
            label: "<-- Back to Live Demo",
            next: "demo-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const demoIncludedNode: Node = {
    id: "demo-included-node",
    type: "info",

    title: "What's Included in the Demo",

    message:
        "Customers can explore:|Homepage|Product pages|Navigation|Shopping experience|Design elements|Mobile responsiveness|User interface layout",

    options: [
        {
            id: "demo-menu",
            label: "<-- Back to Live Demo",
            next: "demo-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const demoNotIncludedNode: Node = {
    id: "demo-not-included-node",
    type: "info",

    title: "What's Not Included",

    message:
        "For security and privacy reasons, the following systems are not publicly accessible within the demo:|Admin Dashboard|Product Management|Order Management|Customer Management|Database Access|Authentication Management|Payment Configuration|Website Settings Dashboard",

    options: [
        {
            id: "demo-menu",
            label: "<-- Back to Live Demo",
            next: "demo-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const purchaseIncludedNode: Node = {
    id: "purchase-included-node",
    type: "info",

    title: "Included With Purchase",

    message:
        "Every purchased website package includes:|Frontend source code|Backend source code|Admin dashboard|Authentication system|Database models|Payment integration|Documentation|Deployment resources",

    options: [
        {
            id: "demo-menu",
            label: "<-- Back to Live Demo",
            next: "demo-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const demoNoteNode: Node = {
    id: "demo-note-node",
    type: "info",

    title: "Important Note",

    message:
        "The live demo represents only a portion of the complete product. The full website package contains additional functionality that is delivered after purchase.",

    options: [
        {
            id: "demo-menu",
            label: "<-- Back to Live Demo",
            next: "demo-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

export const deployNode: Node = {
    id: "deployment-menu",
    type: "info",
    title: "Deployment Workflow Overview",
    message: "CodeCartHub provides a guided deployment experience designed to simplify the launch process. After purchasing a template, customers follow an interactive deployment guide that walks them through connecting GitHub, preparing the repository, configuring services, deploying the application, and launching their website. Each step includes detailed instructions and customers can request AI assistance whenever they encounter an issue.",
    options: [
        {
            id: "demo-menu",
            label: "<-- Back to company menu",
            next: "company-menu"
        },
        {
            id: "main-menu",
            label: "<-- Back to Main Menu",
            next: "main-menu"
        }
    ]
};

