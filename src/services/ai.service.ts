//src/services/ai.service.ts
import { groq } from "../config/groq";
import { ProductFilterService } from "./product-filter.service";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SYSTEM_PROMPT = `

`;

interface AIOptions {
    systemPrompt?: string;
    includeProducts?: boolean;
}
export class AIService {

    static async generateResponse(
        messages: Message[],
        latestMessage: string,
        options: AIOptions = {}
    ): Promise<string> {

        try {

            // 1. Decide if we need product search
            const needsProducts =
            options.includeProducts === true &&
                /(template|website|shop|store|ecommerce|restaurant|portfolio|product|build|design)/i.test(latestMessage);

            let productContext = "";

            // 2. Only fetch products if needed
            if (needsProducts) {
                const products =
                    await ProductFilterService.findRelevantProducts(latestMessage);

                productContext = products.length
                    ? products.map(p => `
Name: ${p.name}
Category: ${p.category}
Description: ${p.description}
Price: ${p.pricing?.sourceCode}
Frontend: ${p.features?.frontend?.join(", ")}
Backend: ${p.features?.backend?.join(", ")}
`).join("\n\n")
                    : "No relevant products found.";
            }

            // 3. Call AI
            const prompt = options.systemPrompt || SYSTEM_PROMPT;


            const groqMessages = [

                {
                    role: "system" as const,
                    content: prompt
                },

                ...(productContext
                    ? [{
                        role: "system" as const,
                        content: `
            AVAILABLE PRODUCTS

            Recommend ONLY from these products when relevant:

            ${productContext}
                        `.trim()
                    }]
                    : []),

                ...messages,

                

            ];


            const completion = await groq.chat.completions.create({
                model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
                temperature: 0.6,
                max_tokens: 1000,
                messages: groqMessages
            });

            return (
                completion.choices?.[0]?.message?.content ||
                "I'm sorry, I couldn't generate a response."
            );

        } catch (error) {
            console.error("GROQ_ERROR:", error);
            throw error;
        }
    }
}