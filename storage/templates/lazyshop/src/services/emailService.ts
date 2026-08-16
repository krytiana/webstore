import axios from "axios";

export const sendResetEmail = async (email: string, token: string) => {
  const clientUrl = process.env.CLIENT_URL?.replace(/\/+$/, "");

  if (!clientUrl || !process.env.EMAIL_SENDER || !process.env.BREVO_API_KEY) {
    throw new Error("Password reset email configuration is incomplete");
  }

  const resetLink = `${clientUrl}/reset-password/${encodeURIComponent(token)}`;

  const data = {
    sender: {
      name: process.env.SITE_NAME || "Store",
      email: process.env.EMAIL_SENDER,
    },
    to: [{ email }],
    subject: "Password Reset Request",
    htmlContent: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  };

  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    data,
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    }
  );

  return response.data;
};
