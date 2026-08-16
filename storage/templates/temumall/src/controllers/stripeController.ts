import { Response } from "express";
import { getStripe } from "../config/stripe";
import Order from "../models/Order";
import { Settings } from "../models/Settings";
import { clearUserCart, createPendingOrder, getCheckoutSnapshot } from "../services/checkoutService";
import { env } from "../config/env";
export const createCartCheckoutSession = async (req: any, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ success: false, message: "Stripe is not configured" });
  try {
    const settings = await Settings.findOne({}).lean();

    if (settings && !settings.enableStripe) {
      return res.status(403).json({
        success: false,
        message: "Stripe payments are disabled"
      });
    }

    const stripeCurrency = (
      settings?.currencyCode ||
      env.stripeCurrency
    ).toLowerCase();

    const userId = String(req.user.userId), email = String(req.user.email || "");
    if (!email) return res.status(400).json({ success: false, message: "User email is required" });
    const snapshot = await getCheckoutSnapshot(userId); const order = await createPendingOrder(userId, "stripe", snapshot);
    try {
      const stripe = getStripe();
      const lineItems = snapshot.items.map((item) => ({
        price_data: {
          currency: stripeCurrency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      }));
      const session = await stripe.checkout.sessions.create({ payment_method_types: ["card"], line_items: lineItems, mode: "payment", customer_email: email, success_url: `${env.clientUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${env.clientUrl}/cancel.html`, metadata: { userId, orderId: order._id.toString() } });
      order.stripeSessionId = session.id; await order.save(); return res.json({ success: true, url: session.url });
    } catch (paymentError) { await order.deleteOne(); throw paymentError; }
  } catch (err: any) {
    console.error("Stripe checkout error:", err); const known = new Set(["Cart is empty", "No default address found", "Invalid cart amount", "Cart contains an invalid product"]);
    return res.status(400).json({ success: false, message: known.has(err?.message) ? err.message : "Stripe checkout failed" });
  }
};
async function markStripeOrderPaid(session: any) {
  const settings = await Settings.findOne({}).lean();

  const stripeCurrency = (
    settings?.currencyCode ||
    env.stripeCurrency
  ).toLowerCase();

  const orderId =
    typeof session.metadata?.orderId === "string"
      ? session.metadata.orderId
      : "";

  const order = orderId
    ? await Order.findById(orderId)
    : await Order.findOne({ stripeSessionId: session.id });

  if (!order) throw new Error("Order snapshot not found");

  if (order.paymentStatus === "paid") return order;

  if (order.paymentProvider !== "stripe") {
    throw new Error("Invalid payment provider");
  }

  if (
    order.user.toString() !==
    String(session.metadata?.userId || "")
  ) {
    throw new Error("Stripe user mismatch");
  }

  if (
    order.stripeSessionId &&
    order.stripeSessionId !== session.id
  ) {
    throw new Error("Stripe session mismatch");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  if (
    session.amount_total !==
    Math.round(order.totalAmount * 100)
  ) {
    throw new Error("Stripe amount mismatch");
  }

  if (
    session.currency &&
    session.currency.toLowerCase() !== stripeCurrency
  ) {
    throw new Error("Stripe currency mismatch");
  }

  order.stripeSessionId = session.id;
  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";

  order.trackingHistory.push({
    status: "confirmed",
    message: "Order placed successfully",
    updatedAt: new Date()
  });

  await order.save();
  await clearUserCart(order.user.toString());

  return order;
}
  export const verifyStripeSuccess = async (req: any, res: Response) => {
    try {
      const sessionId = req.body?.session_id;

      if (
        typeof sessionId !== "string" ||
        sessionId.length < 10 ||
        sessionId.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing session ID"
        });
      }

      const session = await getStripe()
        .checkout
        .sessions
        .retrieve(sessionId);

      if (!session) {
        return res.status(400).json({
          success: false,
          message: "Stripe session not found"
        });
      }

      const order = await markStripeOrderPaid(session);

      return res.json({
        success: true,
        message: "Payment verified",
        orderId: order._id
      });

    } catch (error) {
      console.error(
        "Stripe payment verification error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  };
export const stripeWebhook = async (req: any, res: Response) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET; if (!secret) return res.status(503).send("Stripe webhook is not configured");
  try {
    const signature = req.headers["stripe-signature"] as string | undefined;
    if (!signature || !Buffer.isBuffer(req.body)) return res.status(400).send("Invalid webhook payload");
    const event = getStripe().webhooks.constructEvent(req.body, signature, secret);
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") await markStripeOrderPaid(event.data.object);
    return res.json({ received: true });
  } catch (error) { console.error("Stripe webhook error:", error); return res.status(400).send("Webhook signature or processing error"); }
};
