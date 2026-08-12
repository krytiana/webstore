//src/services/marketingEmailService.ts
import { transporter } from "./emailService";

const sender = {
    name: "Code CartHub",
    address: process.env.EMAIL_SENDER || "support@codecarthub.com",
};

const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:3000"; // Default to localhost if not set


export const sendMarketingEmail = async (
    email: string,
    fullname: string,
    subject: string,
    content: string,
    unsubscribeToken: string
) => {

    try {

        const unsubscribeLink =
            `${CLIENT_URL}/api/marketing/unsubscribe/${unsubscribeToken}`;

        await transporter.sendMail({

            from: sender,

            to: email,

            subject,

            html: `
                <!DOCTYPE html>

                <html>
                <head>
                    <meta charset="UTF-8">

                    <title>${subject}</title>
                </head>

                <body
                    style="
                        margin:0;
                        padding:0;
                        background:#f5f5f5;
                        font-family:Arial,sans-serif;
                    "
                >

                    <div
                        style="
                            max-width:600px;
                            margin:40px auto;
                            background:#ffffff;
                            padding:30px;
                            border-radius:10px;
                        "
                    >

                        <h2>
                            Hello ${fullname || "there"},
                        </h2>

                        <div>
                            ${content}
                        </div>

                        <hr
                            style="
                                margin:30px 0;
                                border:none;
                                border-top:1px solid #ddd;
                            "
                        >

                        <p
                            style="
                                font-size:12px;
                                color:#777;
                            "
                        >
                            You are receiving this email because
                            you subscribed to Code CartHub updates.
                        </p>

                        <p
                            style="
                                font-size:12px;
                            "
                        >
                            <a href="${unsubscribeLink}">
                                Unsubscribe from marketing emails
                            </a>
                        </p>

                        <p
                            style="
                                font-size:12px;
                                color:#777;
                            "
                        >
                            — Code CartHub
                        </p>

                    </div>

                </body>
                </html>
            `,
        });

        console.log(
            `✅ Marketing email sent to ${email}`
        );

        return true;

    } catch (error) {

        console.error(
            `❌ Marketing email failed for ${email}:`,
            error
        );

        return false;
    }
};