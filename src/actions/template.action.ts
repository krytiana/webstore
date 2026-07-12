//src/actions/template.action.ts
import Product from "../models/ProductModel";
import { Node } from "../types/nodesTypes";
import { NodeService } from "../services/NodeService";

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

    static async findTemplateByName(
        name: string,
        chat: any
    ) {

        const template = await Product.findOne({

            name: {
                $regex: name,
                $options: "i"
            },

            isActive: true

        }).select(
            "name slug media.demoUrl features pricing category"
        );

        // Template not found
        if (!template) {

            return {

                success: true,

                node: {
                    id: "template-not-found",
                    type: "info",
                    title: "Template Not Found",
                    message: `I couldn't find a template named "${name}". Please try another template name.`,
                    options: []
                }

            };

        }

        // Remember selected template
        chat.selectedTemplate = template._id;
        chat.currentNode = "template-options";
        await chat.save();

        const node = structuredClone(
            NodeService.getNode("template-options")
        );

        if (!node) {
            return {
                success: false,
                message: "Template options node not found."
            };
        }

        node.title = template.name;

        return {
            success: true,
            node
        };

    }

    private static async getSelectedTemplate(chat: any) {

        return await Product.findById(chat.selectedTemplate);

    }

    static async liveDemo(chat: any) {

        const template = await this.getSelectedTemplate(chat);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "demo-link",
            name: template.name,
            demoUrl: template.media?.demoUrl
        };

    }

    static async features(chat: any) {

        const template = await this.getSelectedTemplate(chat);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "features",
            features: template.features
        };

    }

    static async techStack(chat: any) {

        const template = await this.getSelectedTemplate(chat);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "tech-stack",
            techStack: template.features.techStack
        };

    }

    static async pricing(chat: any) {

        const template = await this.getSelectedTemplate(chat);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "pricing",
            pricing: template.pricing
        };

    }
    
    
}

