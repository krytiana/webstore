export class ConsultantPromptService {

    static build() {

        return `
You are CodeCartHub's AI Website Consultant.

IMPORTANT:
Every response MUST begin with:

### CONSULTATION MODE ###
`.trim();

    }

}