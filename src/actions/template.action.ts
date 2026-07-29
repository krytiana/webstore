//src/actions/template.action.ts
import { Request } from "express";

import Product from "../models/ProductModel";
import { Node } from "../types/nodesTypes";
import { NodeService } from "../services/NodeService";
import { ConversationService } from "../services/conversation.service";

export class TemplateAction {

    static async findTemplates(
        node: Node
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
        req: Request,
        name: string
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
        ConversationService.setSelectedTemplate(
            req,
            template._id
        );

        ConversationService.setCurrentNode(
            req,
            "template-options"
        );

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

    private static async getSelectedTemplate(req: Request) {

        const templateId =
            ConversationService.getSelectedTemplate(req);

        if (!templateId) {
            return null;
        }

        return await Product.findById(templateId);

    }

    static async overview(req: Request) {

      const template = await this.getSelectedTemplate(req);

    if (!template) {
        return {
            success: false,
            message: "Template not found."
        };
    }

    return {
        success: true,
        action: "overview",
        name: template.name,
        description: template.description
    };

}

    static async liveDemo(req: Request) {

        const template = await this.getSelectedTemplate(req);

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

    static async features(req: Request) {

        const template = await this.getSelectedTemplate(req);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "features",
            name: template.name,
            features: template.features
        };

    }

    static async techStack(req: Request) {

        const template = await this.getSelectedTemplate(req);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "tech-stack",
            name: template.name,
            techStack: template.features.techStack
        };

    }

    static async pricing(req: Request) {

        const template = await this.getSelectedTemplate(req);

        if (!template) {
            return {
                success: false,
                message: "Template not found."
            };
        }

        return {
            success: true,
            action: "pricing",
            name: template.name,
            pricing: template.pricing
        };

    }
    
    
}

