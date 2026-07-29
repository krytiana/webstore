//src/services/conversation.service.ts
import { Request } from "express";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export class ConversationService {

    static start(
        req: Request,
        mode: "consultation" | "deployment"
    ) {

        req.session.conversation = {
            mode,
            messages: [],
            currentNode: "main-menu",
            pendingAction: null,
            lockedNodes: [],
            flow: "menu"
        };

    }
    static getSession(req: Request) {
        if (!req.session.conversation) {
            this.start(req, "consultation");
        }

        return req.session.conversation!;
    }

    static get(req: Request): Message[] {
        return this.getSession(req).messages;
    }

    static getMode(req: Request) {
        return this.getSession(req).mode;
    }

    static addUser(req: Request, message: string) {

        this.get(req).push({
            role: "user",
            content: message
        });

    }

    static addAssistant(req: Request, message: string) {

        this.get(req).push({
            role: "assistant",
            content: message
        });

    }

    static clear(req: Request) {
        delete req.session.conversation;
    }

    static getCurrentNode(req: Request) {
      return this.getSession(req).currentNode;
    }

    static setCurrentNode(req: Request, node: string) {
        this.getSession(req).currentNode = node;
    }

    static getPendingAction(req: Request) {
        return this.getSession(req).pendingAction;
    }

    static setPendingAction(req: Request, action: string | null) {
        this.getSession(req).pendingAction = action;
    }

    static getLockedNodes(req: Request) {
        return this.getSession(req).lockedNodes;
    }

    static lockNode(req: Request, node: string) {
        const session = this.getSession(req);

        if (!session.lockedNodes.includes(node)) {
            session.lockedNodes.push(node);
        }
    }

    static getFlow(req: Request) {
        return this.getSession(req).flow;
    }

    static setFlow(req: Request, flow: string) {
        this.getSession(req).flow = flow;
    }

    static setSelectedTemplate(
            req: Request,
            templateId: any
        ) {
            if (!req.session.conversation) return;

            req.session.conversation.selectedTemplate =
                templateId.toString();
        }


        static getSelectedTemplate(
            req: Request
        ) {
            return req.session.conversation?.selectedTemplate;
    }

}