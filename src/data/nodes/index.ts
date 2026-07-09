//src/data/nodes/index.ts

import { Node } from "../../types/nodesTypes";


import { mainNode } from "./main-menu";
import { browseNode, helpChoose } from "./browse-menu";
import { customNode } from "./custom-menu";
import { companyNode } from "./company-menu";
import { supportNode } from "./support-menu";


export const nodes: Record<string, Node> = {
    "main-menu": mainNode,
    "browse-menu": browseNode,
    "business-selector": helpChoose,
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