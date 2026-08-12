//src/routes/marketingRoute.ts
import { Router } from "express";

import {
    subscribe,
    unsubscribe,
    getSubscribers,
    sendMarketingEmailToSubscriber,
    createCampaign
} from "../controllers/marketingController";

const router = Router();


// Subscribe
router.post(
    "/subscribe",
    subscribe
);


// Unsubscribe
router.get(
    "/unsubscribe/:token",
    unsubscribe
);


// Get active subscribers
router.get(
    "/subscribers",
    getSubscribers
);


// Send marketing email
router.post(
    "/send",
    sendMarketingEmailToSubscriber
);

// Create and send campaign
router.post(
    "/campaign",
    createCampaign
);

export default router;