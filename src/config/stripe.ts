import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in .env");
}

export const stripe = new Stripe(stripeSecretKey);

// NOTE:
// Stripe v22 may cause TypeScript issues in CommonJS projects.
// If you see constructor/type errors, use:
// npm install stripe@20.4.1
// OR switch project to ESM.