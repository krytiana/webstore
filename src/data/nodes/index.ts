//src/data/nodes/index.ts

import { Node } from "../../types/nodesTypes";


import { mainNode } from "./main-menu";
import { browseNode, 
        helpChoose, 
        ecommerceResultsNode, 
        portfolioResultsNode,
        blogResultsNode,
        managementSystemResultsNode,
        serviceResultsNode,
        templateSearchNode,
        templateLiveDemo,
        templateFeatures,
        templateTechStack,
        templatePricing,
        templateOptionsNode,
        templateOverview
    } from "./browse-menu";
import { customNode } from "./custom-menu";
import { companyNode } from "./company-menu";
import { supportNode } from "./support-menu";


export const nodes: Record<string, Node> = {
    // Main Menu
    "main-menu": mainNode,

    // Browse Menu
    "browse-menu": browseNode,
    "business-selector": helpChoose,
    "ecommerce-results": ecommerceResultsNode,
    "portfolio-results": portfolioResultsNode,
    "blog-results": blogResultsNode,
    "management-system-results": managementSystemResultsNode,
    "service-results": serviceResultsNode,
    "template-search": templateSearchNode,
    "template-live-demo": templateLiveDemo,
    "template-features": templateFeatures,
    "template-tech-stack": templateTechStack,
    "template-pricing": templatePricing,
    "template-options": templateOptionsNode,
    "template-overview": templateOverview,
    //custom menu
    "custom-menu": customNode,

    // Company Menu
    "company-menu": companyNode,

    // Support Menu
    "support-menu": supportNode
};

export class NodeRegistry {

    static getNode(id: string): Node | null {
        return nodes[id] || null;
    }

    static getAll(): Node[] {
        return Object.values(nodes);
    }

    static exists(id: string): boolean {
        return !!nodes[id];
    }

}