// src/config/paystack.ts

const secretKey = process.env.PAYSTACK_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "PAYSTACK_SECRET_KEY is not set in .env"
  );
}

export const paystackSecretKey: string = secretKey;