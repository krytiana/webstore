import { Request, Response } from "express";
import crypto from "crypto";
import Order from "../models/Order";
import { Settings } from "../models/Settings";
import { clearUserCart, createPendingOrder, getCheckoutSnapshot } from "../services/checkoutService";
import { env } from "../config/env";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
async function verifyWithPaystack(reference: string) {
  if (!PAYSTACK_SECRET) throw new Error("Paystack is not configured");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } });
  const result: any = await response.json(); if (!response.ok || !result.status || result.data?.status !== "success") throw new Error("Paystack payment was not successful"); return result.data;
}
async function markPaystackOrderPaid(payment: any) {
  const settings = await Settings.findOne({}).lean();

  const paystackCurrency = (
    settings?.currencyCode ||
    env.paystackCurrency
  ).toUpperCase();

  const reference =
    typeof payment?.reference === "string"
      ? payment.reference
      : "";

  const orderId =
    typeof payment?.metadata?.orderId === "string"
      ? payment.metadata.orderId
      : "";

  if (!reference) {
    throw new Error("Missing Paystack reference");
  }

  const order = orderId
    ? await Order.findById(orderId)
    : await Order.findOne({
        paystackReference: reference
      });

  if (!order) {
    throw new Error("Order snapshot not found");
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  if (
    order.paymentProvider !== "paystack" ||
    order.paystackReference !== reference
  ) {
    throw new Error("Paystack reference mismatch");
  }

  if (
    payment?.metadata?.userId &&
    String(payment.metadata.userId) !== order.user.toString()
  ) {
    throw new Error("Paystack user mismatch");
  }

  if (
    !Number.isFinite(Number(payment.amount)) ||
    Number(payment.amount) !==
      Math.round(order.totalAmount * 100)
  ) {
    throw new Error("Paystack amount mismatch");
  }

  if (
    payment.currency &&
    String(payment.currency).toUpperCase() !== paystackCurrency
  ) {
    throw new Error("Paystack currency mismatch");
  }

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";

  order.trackingHistory.push({
    status: "confirmed",
    message: "Order placed successfully",
    updatedAt: new Date()
  });

  await order.save();

  await clearUserCart(
    order.user.toString()
  );

  return order;
}
export const createPaystackCheckout = async (req: any, res: Response) => {
  if (!PAYSTACK_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Paystack is not configured"
    });
  }

  try {
    const settings = await Settings.findOne({}).lean();

    if (settings && !settings.enablePaystack) {
      return res.status(403).json({
        success: false,
        message: "Paystack payments are disabled"
      });
    }

    const paystackCurrency = (
      settings?.currencyCode ||
      env.paystackCurrency
    ).toUpperCase();

    const userId = String(req.user.userId);
    const email = String(req.user.email || "");

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email is required"
      });
    }

    const snapshot = await getCheckoutSnapshot(userId);

    const reference =
      `PAY-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

    const order = await createPendingOrder(
      userId,
      "paystack",
      snapshot,
      reference
    );

    try {
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: Math.round(snapshot.totalAmount * 100),

            email,

            currency: paystackCurrency,

            reference,

            callback_url:
              process.env.PAYSTACK_CALLBACK_URL ||
              `${env.clientUrl}/api/paystack/callback`,

            metadata: {
              userId,
              orderId: order._id.toString(),
              reference,
              fullname: snapshot.shippingAddress.fullName,
              phone: snapshot.shippingAddress.phone
            }
          })
        }
      );

      const result: any = await response.json();

      if (
        !response.ok ||
        !result.status ||
        !result.data?.authorization_url
      ) {
        throw new Error(
          result.message || "Paystack initialization failed"
        );
      }

      return res.json({
        success: true,
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference
      });

    } catch (paymentError) {
      await order.deleteOne();
      throw paymentError;
    }

  } catch (error: any) {
    console.error("Paystack checkout error:", error);

    const known = new Set([
      "Cart is empty",
      "No default address found",
      "Invalid cart amount",
      "Cart contains an invalid product"
    ]);

    return res.status(400).json({
      success: false,
      message: known.has(error?.message)
        ? error.message
        : "Paystack checkout failed"
    });
  }
};
export const verifyPaystackPayment = async (
  req: Request,
  res: Response
) => {
  const reference =
    typeof req.query.reference === "string"
      ? req.query.reference
      : "";

  if (!reference) {
    return res.redirect(
      "/success.html?payment=paystack&status=failed"
    );
  }

  try {
    console.log("Paystack callback reference:", reference);

    const payment =
      await verifyWithPaystack(reference);

    console.log("Paystack verified payment:", {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      metadata: payment.metadata
    });

    await markPaystackOrderPaid(payment);

    return res.redirect(
      `/success.html?payment=paystack&status=success&reference=${encodeURIComponent(reference)}`
    );

  } catch (error: any) {

    console.error(
      "Paystack verification error:",
      error
    );

    return res.redirect(
      `/success.html?payment=paystack&status=failed&reference=${encodeURIComponent(reference)}&error=${encodeURIComponent(
        error?.message || "Unknown Paystack verification error"
      )}`
    );
  }
};
export const paystackWebhook = async (req: Request, res: Response) => {
  if (!PAYSTACK_SECRET) return res.status(503).send("Paystack is not configured");
  try {
    const signature = req.headers["x-paystack-signature"]; const rawBody = (req as any).rawBody;
    if (typeof signature !== "string" || !Buffer.isBuffer(rawBody) || !/^[a-f0-9]{128}$/i.test(signature)) return res.status(401).send("Invalid signature");
    const expectedBuffer = Buffer.from(crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex"), "utf8"); const providedBuffer = Buffer.from(signature, "utf8");
    if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) return res.status(401).send("Invalid signature");
    if (req.body?.event !== "charge.success") return res.status(200).json({ received: true });
    await markPaystackOrderPaid(req.body.data); return res.status(200).json({ received: true });
  } catch (error) { console.error("Paystack webhook error:", error); return res.status(500).json({ received: false, message: "Webhook processing failed" }); }
};
