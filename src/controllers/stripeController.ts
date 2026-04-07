// src/controllers/stripeController.ts
import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import Product, { IProduct } from "../models/ProductModel";
import User from "../models/User";
import DownloadLink from "../models/DownloadLink";

// ----------------------------
// Types
// ----------------------------
const validPlans = ["sourceCode", "assistedSetup", "doneForYou"] as const;
type PlanType = typeof validPlans[number];

// ----------------------------
// CREATE CHECKOUT SESSION
// ----------------------------
export const createCartCheckoutSession = async (req: any, res: Response) => {
  try {
    console.log("🛒 Checkout request received");

    const userId: string = req.user?.userId;

    // Support BOTH query + body (prevents crashes)
    const productSlug: string = req.body.productSlug || req.query.product;
    const planRaw: string = req.body.plan || req.query.plan;

    console.log("BODY:", req.body);
    console.log("QUERY:", req.query);
    console.log("USER:", userId);

    // Validate inputs
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!productSlug || !planRaw) {
      return res.status(400).json({
        success: false,
        message: "Missing product or plan",
      });
    }

    if (!validPlans.includes(planRaw as PlanType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const plan: PlanType = planRaw as PlanType;

    // Fetch product
    console.log("🔍 Fetching product...");
    const product: IProduct | null = await Product.findOne({ slug: productSlug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get price
    const price = product.pricing[plan];

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricing",
      });
    }

    console.log("💵 Price:", price);

    const BASE_URL = process.env.BASE_URL || "https://codecarthub.com";

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${product.name} - ${plan}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel.html`,

      metadata: {
        userId: userId.toString(),
        productId: product._id.toString(),
        plan,
      },
    });

    console.log("✅ Stripe session created:", session.id);

    return res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({
      success: false,
      message: "Stripe checkout failed",
    });
  }
};

// ----------------------------
// STRIPE WEBHOOK
// ----------------------------
export const stripeWebhook = async (req: Request, res: Response) => {
  console.log("📩 Webhook endpoint HIT");

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return res.status(400).send("No signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Signature verified");
  } catch (err: any) {
    console.error("⚠️ Signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("📦 Event:", event.type);

  // ----------------------------
  // HANDLE SUCCESSFUL PAYMENT
  // ----------------------------
  if (event.type === "checkout.session.completed") {
    console.log("💰 Payment completed");

    const session: any = event.data.object;
    const metadata = session.metadata || {};

    console.log("📌 Metadata:", metadata);

    const { userId, productId, plan } = metadata;

    if (!userId || !productId || !plan) {
      console.error("❌ Missing metadata");
      return res.status(400).send("Missing metadata");
    }

    try {
      if (!validPlans.includes(plan as PlanType)) {
        throw new Error("Invalid plan type");
      }

      console.log("🔍 Fetching user...");
      const user = await User.findById(userId);

      console.log("🔍 Fetching product...");
      const product = await Product.findById(productId);

      if (!user || !product) {
        throw new Error("User or product not found");
      }

      const BASE_URL = process.env.BASE_URL || "https://codecarthub.com";

      const downloadUrl = `${BASE_URL}/downloads/${product.slug}-${plan}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}.zip`;

      console.log("🔗 Download URL:", downloadUrl);

      const downloadLink = await DownloadLink.create({
        user: user._id,
        product: product._id,
        plan,
        url: downloadUrl,
        maxDownloads: 3,
        successfulDownloads: 0,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

      console.log("✅ Download link saved:", downloadLink._id);

      // OPTIONAL: send email here
      console.log(`📧 Send email to: ${user.email}`);
    } catch (err) {
      console.error("❌ Webhook processing error:", err);
    }
  } else {
    console.log("ℹ️ Ignored event:", event.type);
  }

  console.log("📤 Responding to Stripe\n");
  res.status(200).json({ received: true });
};