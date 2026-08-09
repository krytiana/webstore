import axios from "axios";

export const sendResetEmail = async (email: string, token: string) => {
  try {
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const data = {
      sender: {
        name: "Temperate App",
        email: process.env.EMAIL_SENDER
      },
      to: [
        {
          email: email
        }
      ],
      subject: "Password Reset Request",
      htmlContent: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      data,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Reset email sent:", response.data);

  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};