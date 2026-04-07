// src/controllers/stripeController.ts
import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import Product, { IProduct } from "../models/ProductModel";
import User from "../models/User";
import DownloadLink from "../models/DownloadLink";

// ----------------------------
// Single product checkout
// ----------------------------
const validPlans = ["sourceCode", "assistedSetup", "doneForYou"] as const;
type PlanType = typeof validPlans[number];

export const createCartCheckoutSession = async (req: any, res: Response) => {
  try {
    const userId: string = req.user.userId;
    const productSlug: string = req.body.productSlug;
    const planRaw: string = req.body.plan;

    // Validate plan
    if (!validPlans.includes(planRaw as PlanType)) {
      return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }
    const plan: PlanType = planRaw as PlanType;

    // Fetch product
    const product: IProduct | null = await Product.findOne({ slug: productSlug });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Get price
    const price = product.pricing[plan];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
      mode: "payment",
        success_url: "https://codecarthub.com/success.html?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://codecarthub.com/cancel.html",
      metadata: {
        userId: userId.toString(),
        productId: product._id.toString(),
        plan,
      },
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ success: false, message: "Stripe checkout failed" });
  }
};

// ----------------------------
// Stripe webhook for order creation & download link
// ----------------------------

export const stripeWebhook = async (req: Request, res: Response) => {
  console.log("📩 Webhook endpoint HIT");

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    console.error("❌ No Stripe signature found in headers");
    return res.status(400).send("No signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Webhook signature verified");
  } catch (err: any) {
    console.error("⚠️ Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("📦 Event received:", event.type);

  // ------------------------
  // Handle checkout success
  // ------------------------
  if (event.type === "checkout.session.completed") {
    console.log("💰 Checkout session completed event triggered");

    const session: any = event.data.object;

    console.log("🧾 Full session object:", JSON.stringify(session, null, 2));

    const metadata = session.metadata || {};
    const { userId, productId, plan } = metadata;

    console.log("📌 Extracted metadata:", metadata);

    if (!userId || !productId || !plan) {
      console.error("❌ Missing metadata:", { userId, productId, plan });
      return res.status(400).send("Missing metadata");
    }

    try {
      console.log("🔍 Validating plan...");
      if (!validPlans.includes(plan as PlanType)) {
        throw new Error("Invalid plan type");
      }

      console.log("🔍 Fetching user...");
      const user = await User.findById(userId);
      console.log("User found:", !!user);

      console.log("🔍 Fetching product...");
      const product = await Product.findById(productId);
      console.log("Product found:", !!product);

      if (!user || !product) {
        throw new Error("User or product not found");
      }

      const BASE_URL = process.env.BASE_URL || "https://codecarthub.com";

      const downloadUrl = `${BASE_URL}/downloads/${product.slug}-${plan}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 8)}.zip`;

      console.log("🔗 Generated download URL:", downloadUrl);

      console.log("💾 Saving download link...");
      const downloadLink = await DownloadLink.create({
        user: user._id,
        product: product._id,
        plan: plan as PlanType,
        url: downloadUrl,
        maxDownloads: 3,
        successfulDownloads: 0,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

      console.log("✅ Download link saved:", downloadLink._id);

      console.log(`🎉 SUCCESS: Email ${user.email} should receive link`);
    } catch (err) {
      console.error("❌ Error inside webhook processing:", err);
    }
  } else {
    console.log("ℹ️ Unhandled event type:", event.type);
  }

  console.log("📤 Sending 200 response to Stripe\n");

  res.status(200).json({ received: true });
};