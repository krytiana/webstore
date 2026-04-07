// src/controllers/stripeController.ts
import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import Product, { IProduct } from "../models/ProductModel";
import User from "../models/User";
import DownloadLink from "../models/DownloadLink";
import { sendDownloadLinkEmail } from "../services/emailService";


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

    if (!userId) {
      console.warn("❌ Unauthorized request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const productSlug: string = req.body.productSlug || req.query.product;
    const planRaw: string = req.body.plan || req.query.plan;

    console.log("BODY:", req.body);
    console.log("QUERY:", req.query);

    if (!productSlug || !planRaw) {
      return res.status(400).json({
        success: false,
        message: "Missing product or plan",
      });
    }

    if (!validPlans.includes(planRaw as PlanType)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const plan: PlanType = planRaw as PlanType;

    // Fetch product
    console.log("🔍 Fetching product...");
    const product = await Product.findOne({ slug: productSlug });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const price = product.pricing[plan];
    if (!price) {
      return res.status(400).json({ success: false, message: "Invalid pricing" });
    }

    console.log(`💵 Price for ${plan}: $${price}`);

    const BASE_URL = process.env.BASE_URL || "https://codecarthub.com";

    // Create Stripe Checkout session
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
            unit_amount: price * 100, // Stripe expects cents
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
  console.log("📩 Stripe webhook hit");

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return res.status(400).send("Missing signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Signature verified");
  } catch (err: any) {
    console.error("⚠️ Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("📦 Event type:", event.type);

  if (event.type === "checkout.session.completed") {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id
      );

      const metadata = session.metadata || {};
      const { userId, productId, plan } = metadata;

      if (!userId || !productId || !plan) {
        throw new Error("Missing metadata in session");
      }

      if (!validPlans.includes(plan as PlanType)) {
        throw new Error("Invalid plan type");
      }

      // Fetch user & product
      const user = await User.findById(userId);
      const product = await Product.findById(productId);
      if (!user || !product) throw new Error("User or product not found");

      const BASE_URL = process.env.BASE_URL || "https://codecarthub.com";

      // ✅ Step 1: Create download record FIRST
      const downloadLink = await DownloadLink.create({
        user: user._id,
        product: product._id,
        plan,
        url: "", // will update after
        maxDownloads: 3,
        successfulDownloads: 0,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

      // ✅ Step 2: Generate secure link using ID
      const downloadUrl = `${BASE_URL}/downloads/${downloadLink._id}`;

      // ✅ Step 3: Save URL
      downloadLink.url = downloadUrl;
      await downloadLink.save();

      // ✅ Step 4: Send email
      await sendDownloadLinkEmail(
        user.email,
        downloadUrl,
        product.name,
        plan
      );

      console.log("✅ Download link saved:", downloadLink._id);
      console.log("🔗 Secure URL:", downloadUrl);
      console.log(`📧 Email sent to: ${user.email}`);

    } catch (err: any) {
      console.error("❌ Webhook processing error:", err.message);
      return res.status(200).json({ received: true, error: err.message });
    }
  } else {
    console.log("ℹ️ Ignored event type:", event.type);
  }

  res.status(200).json({ received: true });
};