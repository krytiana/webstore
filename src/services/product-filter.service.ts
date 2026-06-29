import Product from "../models/ProductModel";

interface ScoredProduct {
    product: any;
    score: number;
}

export class ProductFilterService {

    static async findRelevantProducts(query: string) {

        const products = await Product.find({ isActive: true }).lean();

        const scored: ScoredProduct[] = products.map(product => {

            let score = 0;

            const text = `
                ${product.name}
                ${product.category}
                ${product.description}
                ${product.features?.frontend?.join(" ")}
                ${product.features?.backend?.join(" ")}
                ${product.features?.techStack}
            `.toLowerCase();

            const q = query.toLowerCase();

            // 🔥 NAME MATCH (highest weight)
            if (text.includes(q)) score += 5;

            // 🔥 CATEGORY MATCH
            if (product.category?.toLowerCase().includes(q)) score += 4;

            // 🔥 KEYWORD MATCHING
            const keywords = q.split(" ");

            for (const word of keywords) {
                if (text.includes(word)) score += 1;
            }

            // 🔥 FEATURE MATCH BOOST
            if (text.includes("ecommerce") && q.includes("shop")) score += 3;
            if (text.includes("restaurant") && q.includes("food")) score += 3;
            if (text.includes("portfolio") && q.includes("designer")) score += 3;
            if (text.includes("booking") && q.includes("appointment")) score += 3;

            return { product, score };
        });

        return scored
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(p => p.product);
    }
}