//src/data/nodes/index.ts

import { Node } from "../../types/nodesTypes";


import { mainNode } from "./main-menu";
import { browseNode, helpChoose, ecommerceResultsNode } from "./browse-menu";
import { customNode } from "./custom-menu";
import { companyNode } from "./company-menu";
import { supportNode } from "./support-menu";


export const nodes: Record<string, Node> = {
    "main-menu": mainNode,
    "browse-menu": browseNode,
    "business-selector": helpChoose,
    "ecommerce-results": ecommerceResultsNode,
    "custom-menu": customNode,
    "company-menu": companyNode,
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