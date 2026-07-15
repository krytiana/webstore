//src/types/nodesTypes.ts
export type NodeOption = {
    id: string;
    label: string;
    next?: string;

    // Phase 2+ behavior hooks
    lockNode?: boolean;
    tag?: "lead_required" | "info" | "support" | "browse";
};

export type Node = {
    id: string;
    type: "menu" | "action" | "info" | "end" | "input";

    title?: string;
    message?: string;

    options?: NodeOption[];

    action?: 
    "findTemplates" 
    | "findTemplateByName" 
    | "templateLiveDemo"
    | "templateFeatures"
    | "templateTechStack"
    | "templatePricing"
    | "templateOverview"
    | "renderAccountCreation"
    | "newWebServiceCreation"
    | "selectingGithubRepository"
    | "configuringBuildSettings"
    | "mongodbAccountSetup"
    | "renderEnvironmentVariables"

    ;

    category?: 
    "E-commerce"
    | "Portfolio"
    | "Blog"
    | "Management System"
    | "Service";
};