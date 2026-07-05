//src/services/chat-menu.service.ts
export class ChatMenuService {

    static handle(message: string): string | null {

        const text = message.toLowerCase().trim();

        if (["hi", "hello", "hey"].includes(text)) {
            return `
👋 Welcome back!

How can I help you today?

1. 🛒 Browse website templates
2. 🎨 Customize a template
3. 💻 Build a custom website
4. 💰 Pricing & packages
5. 🛠 Technical support
6. 💬 Talk to a consultant
            `.trim();
        }

        if (text === "1") {
            return `
🛒 Browse Templates

Choose a category:

• Ecommerce
• Restaurant
• School
• Hotel
• Portfolio
            `.trim();
        }

        if (text === "2") {
            return `
🎨 Template Customization

Tell me:
• Which template you want
• What changes you need
            `.trim();
        }

        if (text === "3") {
            return `
💻 Custom Website

Tell me:
• Business type
• Features needed
• Payment requirements
            `.trim();
        }

        if (text === "4") {
            return `
💰 Pricing & Packages

We offer:
• Source Code
• Assisted Setup
• Done For You

What’s your budget?
            `.trim();
        }

        if (text === "5") {
            return `
🛠 Technical Support

Describe your issue and we’ll help you.
            `.trim();
        }

        return null;
    }
}