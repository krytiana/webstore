//src/services/context-builder.service.ts
import Product from "../models/ProductModel";
import { CompanyKnowledgeService }
from "./company-knowledge.service";

export class ContextBuilderService {

    static async build(): Promise<string> {

        const companyKnowledge =
            await CompanyKnowledgeService.getContext();

        const products =
            await Product.find({
                isActive: true
            })
            .select(
                "name category description features pricing"
            )
            .lean();

        const templateContext =
            products
                .map(product => {

                    return `
Template Name:
${product.name}

Category:
${product.category}

Description:
${product.description}

Technology:
${product.features?.techStack || "Not specified"}

Frontend Features:
${product.features?.frontend?.join(", ") || ""}

Backend Features:
${product.features?.backend?.join(", ") || ""}

Pricing:

Source Code:
$${product.pricing?.sourceCode || 0}

Assisted Setup:
$${product.pricing?.assistedSetup || 0}

Done For You:
$${product.pricing?.doneForYou || 0}
`;
                })
                .join("\n\n");

        return `
COMPANY KNOWLEDGE

${companyKnowledge}

AVAILABLE TEMPLATES

${templateContext}
`;
    }
}