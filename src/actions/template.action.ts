import Product from "../models/ProductModel";
import { Node } from "../types/nodesTypes";

export class TemplateAction {

    static async findTemplates(
        node: Node,
        chat: any
    ) {

        const templates = await Product.find({

            category: node.category,

            isActive: true

        })
        .select(
            "name slug media.demoUrl"
        )
        .sort({
            createdAt: -1
        });
        const demos = templates.map(template => ({
            name: template.name,
            slug: template.slug,
            demoUrl: template.media?.demoUrl
        }));

        // Nothing found
        if (templates.length === 0) {

            return {

                success: true,

                action: "ai",

                message:
                    `We currently don't have a ${node.category} template. I'll help you request one.`,

                category: node.category

            };

        }

        // Templates found
        return {
            success: true,
            action: "demo-links",
            message: `I found ${demos.length} ${node.category} website template(s). Click any demo below to preview it.`,
            demos
        };

    }

}