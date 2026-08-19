import Stripe from "stripe";
let client: Stripe | null = null;
export const getStripe = () => {
  if (client) return client;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  client = new Stripe(secret, { apiVersion: "2026-02-25.clover" });
  return client;
};
