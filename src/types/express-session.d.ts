// src/types/session.d.ts

import "express-session";

declare module "express-session" {

    interface SessionData {

        conversation?: {
            mode: "consultation" | "deployment";

            messages: {
                role: "user" | "assistant";
                content: string;
            }[];

            currentNode: string;

            pendingAction: string | null;

            lockedNodes: string[];

            flow: string;

            selectedTemplate?: string;
        };

    }

}