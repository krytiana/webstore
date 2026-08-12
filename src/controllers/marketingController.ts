//src/controllers/marketingController.ts
import { Request, Response } from "express";
import crypto from "crypto";

import Subscriber from "../models/Subscriber";
import Campaign from "../models/Campaign";

import {
    sendMarketingEmail,
} from "../services/marketingEmailService";
// ==========================================
// SUBSCRIBE
// ==========================================

export const subscribe = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            email,
            fullname,
            userId,
        } = req.body;


        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        const existingSubscriber =
            await Subscriber.findOne({
                email: normalizedEmail,
            });


        // Already subscribed
        if (
            existingSubscriber &&
            existingSubscriber.subscribed
        ) {

            return res.status(400).json({
                success: false,
                message: "Email is already subscribed.",
            });

        }


        // Existing but previously unsubscribed
        if (existingSubscriber) {

            existingSubscriber.subscribed = true;

            existingSubscriber.subscribedAt =
                new Date();

            existingSubscriber.unsubscribedAt = null;

            await existingSubscriber.save();

            return res.status(200).json({
                success: true,
                message: "Subscription restored.",
            });
        }


        const unsubscribeToken =
            crypto.randomBytes(32).toString("hex");


        const subscriber =
            new Subscriber({

                user: userId || null,

                email: normalizedEmail,

                fullname: fullname || "",

                subscribed: true,

                subscribedAt: new Date(),

                unsubscribeToken,
            });


        await subscriber.save();


        return res.status(201).json({

            success: true,

            message:
                "Successfully subscribed to marketing emails.",
        });


    } catch (error) {

        console.error(
            "❌ Subscribe error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to subscribe.",
        });

    }
};

// ==========================================
// UNSUBSCRIBE
// ==========================================

export const unsubscribe = async (
    req: Request,
    res: Response
) => {

    try {

        const { token } = req.params;


        const subscriber =
            await Subscriber.findOne({
                unsubscribeToken: token,
            });


        if (!subscriber) {

            return res.status(404).send(
                "Invalid unsubscribe link."
            );

        }


        subscriber.subscribed = false;

        subscriber.unsubscribedAt =
            new Date();


        await subscriber.save();


        return res.status(200).send(`
            <html>

                <body
                    style="
                        font-family:Arial;
                        text-align:center;
                        padding:60px;
                    "
                >

                    <h2>
                        You have been unsubscribed.
                    </h2>

                    <p>
                        You will no longer receive
                        marketing emails from Code CartHub.
                    </p>

                </body>

            </html>
        `);


    } catch (error) {

        console.error(
            "❌ Unsubscribe error:",
            error
        );

        return res.status(500).send(
            "Unable to unsubscribe."
        );

    }
};

// ==========================================
// GET SUBSCRIBERS
// ==========================================

export const getSubscribers = async (
    req: Request,
    res: Response
) => {

    try {

        const subscribers =
            await Subscriber.find({
                subscribed: true,
            })
            .select(
                "email fullname subscribed subscribedAt"
            )
            .sort({
                subscribedAt: -1,
            });


        return res.status(200).json({

            success: true,

            count: subscribers.length,

            subscribers,
        });


    } catch (error) {

        console.error(
            "❌ Get subscribers error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch subscribers.",
        });

    }
};

// ==========================================
// SEND ONE MARKETING EMAIL
// ==========================================

export const sendMarketingEmailToSubscriber =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const {
                email,
                subject,
                content,
            } = req.body;


            if (!email || !subject || !content) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email, subject and content are required.",
                });

            }


            const subscriber =
                await Subscriber.findOne({

                    email:
                        email.toLowerCase().trim(),

                    subscribed: true,
                });


            if (!subscriber) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Active subscriber not found.",
                });

            }


            const sent =
                await sendMarketingEmail(

                    subscriber.email,

                    subscriber.fullname || "there",

                    subject,

                    content,

                    subscriber.unsubscribeToken
                );


            if (!sent) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to send marketing email.",
                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Marketing email sent successfully.",
            });


        } catch (error) {

            console.error(
                "❌ Send marketing email error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to send marketing email.",
            });

        }
};

// ==========================================
// CREATE MARKETING CAMPAIGN
// ==========================================

export const createCampaign = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            subject,
            content,
            recipientType,
            selectedEmails,
            startDate,
            endDate,
        } = req.body;


        // ==========================================
        // VALIDATE CAMPAIGN
        // ==========================================

        if (!subject || !content) {

            return res.status(400).json({

                success: false,

                message:
                    "Subject and content are required.",

            });

        }


        // ==========================================
        // VALIDATE RECIPIENT TYPE
        // ==========================================

        const type =
            recipientType || "all";


        if (
            !["all", "specific", "date"].includes(type)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid recipient type.",

            });

        }


        // ==========================================
        // FIND RECIPIENTS
        // ==========================================

        let subscribers;


        // ------------------------------------------
        // ALL ACTIVE SUBSCRIBERS
        // ------------------------------------------

        if (type === "all") {

            subscribers =
                await Subscriber.find({

                    subscribed: true,

                });

        }


        // ------------------------------------------
        // SPECIFIC SUBSCRIBERS
        // ------------------------------------------

        else if (type === "specific") {

            if (
                !Array.isArray(selectedEmails) ||
                selectedEmails.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select at least one subscriber.",

                });

            }


            const normalizedEmails =
                selectedEmails
                    .map((email: string) =>
                        email.toLowerCase().trim()
                    );


            subscribers =
                await Subscriber.find({

                    email: {
                        $in: normalizedEmails,
                    },

                    subscribed: true,

                });

        }


        // ------------------------------------------
        // SUBSCRIBERS BY DATE
        // ------------------------------------------

        else {

            if (!startDate || !endDate) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Start date and end date are required.",

                });

            }


            const start =
                new Date(`${startDate}T00:00:00.000Z`);


            const end =
                new Date(`${endDate}T23:59:59.999Z`);


            if (
                isNaN(start.getTime()) ||
                isNaN(end.getTime())
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid date range.",

                });

            }


            if (start > end) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Start date cannot be after end date.",

                });

            }


            subscribers =
                await Subscriber.find({

                    subscribed: true,

                    subscribedAt: {
                        $gte: start,
                        $lte: end,
                    },

                });

        }


        // ==========================================
        // NO RECIPIENTS
        // ==========================================

        if (subscribers.length === 0) {

            return res.status(400).json({

                success: false,

                message:
                    "No active subscribers match your selected filter.",

            });

        }


        // ==========================================
        // CREATE CAMPAIGN RECORD
        // ==========================================

        const campaign =
            await Campaign.create({

                subject,

                content,

                totalRecipients:
                    subscribers.length,

                successful: 0,

                failed: 0,

                status: "sending",

            });


        let successful = 0;

        let failed = 0;


        // ==========================================
        // SEND EMAILS
        // ==========================================

        for (const subscriber of subscribers) {

            try {

                const sent =
                    await sendMarketingEmail(

                        subscriber.email,

                        subscriber.fullname || "there",

                        subject,

                        content,

                        subscriber.unsubscribeToken

                    );


                if (sent) {

                    successful++;

                } else {

                    failed++;

                }

            } catch (error) {

                console.error(
                    `❌ Failed to send campaign email to ${subscriber.email}:`,
                    error
                );

                failed++;

            }

        }


        // ==========================================
        // UPDATE CAMPAIGN RESULTS
        // ==========================================

        campaign.successful =
            successful;

        campaign.failed =
            failed;

        campaign.status =
            successful > 0
                ? "completed"
                : "failed";

        campaign.completedAt =
            new Date();


        await campaign.save();


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Campaign completed.",

            campaignId:
                campaign._id,

            recipientType:
                type,

            totalRecipients:
                subscribers.length,

            successful,

            failed,

        });


    } catch (error) {

        console.error(
            "❌ Create campaign error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create campaign.",

        });

    }

};

