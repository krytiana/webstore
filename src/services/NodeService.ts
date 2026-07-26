//src/services/NodeService.ts
import { NodeRegistry } from "../data/nodes";

export class NodeService {

    static getNode(nodeId: string) {
        return NodeRegistry.getNode(nodeId);
    }

    static handleOption(nodeId: string, optionId: string) {

        const node = this.getNode(nodeId);

        if (!node) return null;

        const options = node.options ?? [];
        const option = options.find(
            o => o.id === optionId
        );

        if (!option) return null;

        return {
            option,
            next: option.next || null,
            lockNode: option.lockNode || false,
            tag: option.tag || null,
            data: option.data
        };

    }

}