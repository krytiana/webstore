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
      success_url: `$/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `$/cancel.html`,
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
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature mismatch", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const { userId, productId, plan } = session.metadata;

    if (!userId || !productId || !plan) {
      console.error("Webhook metadata missing userId/productId/plan");
      return res.status(400).send("Missing metadata");
    }

    try {
      // Validate plan type
      if (!validPlans.includes(plan as PlanType)) throw new Error("Invalid plan type");

      // Fetch user & product
      const user = await User.findById(userId);
      const product = await Product.findById(productId);
      if (!user || !product) throw new Error("User or product not found");

      // Generate secure download link
      const downloadUrl = `/downloads/${product.slug}-${plan}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 8)}.zip`;

      const downloadLink = await DownloadLink.create({
        user: user._id,
        product: product._id,
        plan: plan as PlanType,
        url: downloadUrl,
        maxDownloads: 3,
        successfulDownloads: 0,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
      });

      // TODO: Send email to user with downloadLink.url
      console.log(`✅ Payment received. Download link for ${user.email}: ${downloadLink.url}`);

    } catch (err) {
      console.error("❌ Error processing checkout webhook:", err);
    }
  }

  res.status(200).json({ received: true });
};