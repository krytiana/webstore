import fs from "fs";
import path from "path";

export class NodeService {

    private static nodePath = path.join(
        process.cwd(),
        "src",
        "data",
        "nodes"
    );

    static getNode(nodeName: string) {

        const file = path.join(
            this.nodePath,
            `${nodeName}.json`
        );

        if (!fs.existsSync(file)) {
            return null;
        }

        return JSON.parse(
            fs.readFileSync(file, "utf8")
        );
    }

    static getNextNode(
        nodeName: string,
        optionId: string
    ) {

        const node = this.getNode(nodeName);

        if (!node) return null;

        const option = node.options.find(
            (item: any) => item.id === optionId
        );

        if (!option) return null;

        if (!option.next) {

            return {
                id: nodeName,
                type: "end",
                message: "No further steps."
            };

        }

        return this.getNode(option.next);

    }

}