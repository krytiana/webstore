// src/services/emailService.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "mail.privateemail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sender = {
  name: "Code CartHub",
  address: process.env.EMAIL_SENDER || "support@codecarthub.com",
};

// ---------------------------
// Send password reset email
// ---------------------------
export const sendResetEmail = async (email: string, token: string) => {
  try {
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>

        <p>You requested to reset your password.</p>

        <p>Click the link below to reset your password:</p>

        <p>
          <a href="${resetLink}">${resetLink}</a>
        </p>

        <p>This link expires in 1 hour.</p>

        <p>
          If you did not request a password reset, you can safely ignore
          this email.
        </p>

        <p>— Code CartHub</p>
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
  }
};

// ---------------------------
// Send download link email
// ---------------------------
export const sendDownloadLinkEmail = async (
  email: string,
  downloadUrl: string,
  productName: string,
  plan: string
) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: `Your Download Link for ${productName}`,
      html: `
        <h2>Thank you for your purchase!</h2>

        <p>
          Your download link for
          <strong>${productName} - ${plan}</strong>
          is ready.
        </p>

        <p>
          <a href="${downloadUrl}">Download your product</a>
        </p>

        <p>
          This link expires in 48 hours and can be used 3 times.
        </p>

        <p>— Code CartHub</p>
      `,
    });

    console.log(`✅ Download email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending download email:", error);
  }
};


export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  try {
    const verificationLink =
      `${process.env.CLIENT_URL}/api/users/verify-email/${token}`;

    await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Verify Your Code CartHub Email",
      html: `
        <h2>Welcome to Code CartHub!</h2>

        <p>
          Thank you for creating an account.
        </p>

        <p>
          Please verify your email address by clicking the button below:
        </p>

        <p>
          <a href="${verificationLink}">
            Verify My Email
          </a>
        </p>

        <p>
          This verification link expires in 24 hours.
        </p>

        <p>
          If you didn't create this account, you can safely ignore this email.
        </p>

        <p>— Code CartHub</p>
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};