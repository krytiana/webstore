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

            // old menu system
            currentNode: string;

            pendingAction: string | null;

            lockedNodes: string[];

            flow: string;


            // template selection
            selectedTemplate?: string;


            // consultation system
            consultationStep: number;

            websiteSummary: string;

            leadCaptured: boolean;

        };

    }

}