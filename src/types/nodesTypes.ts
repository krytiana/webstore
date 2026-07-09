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
    type: "menu" | "action" | "info" | "end";

    title?: string;
    message?: string;

    options?: NodeOption[];

    action?: "findTemplates";
    category?: 
    "ecommerce"
    | "portfolio"
    | "blog"
    | "management-system"
    | "service";
};