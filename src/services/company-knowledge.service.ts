import axios from "axios";
import * as cheerio from "cheerio";

export class CompanyKnowledgeService {

    static async getContext(): Promise<string> {

        try {

            const { data } = await axios.get(
                "https://codecarthub.com/documentation.html"
            );

            const $ = cheerio.load(data);

            const text = $("body").text();

            return text
                .replace(/\s+/g, " ")
                .trim();

        } catch (error) {

            console.error(
                "COMPANY_KNOWLEDGE_ERROR:",
                error
            );

            return `
CodeCartHub sells website templates,
offers customization services,
live demos,
one-click deployment,
and fully custom website development.
`;
        }
    }
}