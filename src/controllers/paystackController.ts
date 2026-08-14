// src/controllers/paystackController.ts

import { Request, Response } from "express";
import crypto from "crypto";

import { paystackSecretKey } from "../config/paystack";
import Product from "../models/ProductModel";
import User from "../models/User";
import DownloadLink from "../models/DownloadLink";
import { sendDownloadLinkEmail,sendDashboardLinkEmail, } from "../services/emailService";
import ServiceOrder from "../models/ServiceOrder";

// ============================================================
// TYPES
// ============================================================

const validPlans = [
  "sourceCode",
  "assistedSetup",
  "doneForYou",
] as const;

type PlanType = typeof validPlans[number];


// ============================================================
// PAYSTACK REQUEST HELPER
// ============================================================

const paystackRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  const response = await fetch(
    `https://api.paystack.co${endpoint}`,
    {
      ...options,

      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(
      data.message || "Paystack request failed"
    );
  }

  return data;
};


// ============================================================
// CREATE PAYSTACK CHECKOUT
// ============================================================

export const createCartCheckoutSession = async (
  req: any,
  res: Response
) => {

  try {

    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    const userId: string = req.user?.userId;

    if (!userId) {

      console.warn("❌ Unauthorized payment request");

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    }


    // --------------------------------------------------------
    // PRODUCT + PLAN
    // --------------------------------------------------------

    const productSlug: string =
      req.body.productSlug ||
      req.query.product;

    const planRaw: string =
      req.body.plan ||
      req.query.plan;


    if (!productSlug || !planRaw) {

      return res.status(400).json({
        success: false,
        message: "Missing product or plan",
      });

    }


    if (!validPlans.includes(planRaw as PlanType)) {

      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });

    }


    const plan = planRaw as PlanType;


    // --------------------------------------------------------
    // FETCH USER
    // --------------------------------------------------------

    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    // --------------------------------------------------------
    // FETCH PRODUCT
    // --------------------------------------------------------

    const product = await Product.findOne({
      slug: productSlug,
    });

    if (!product) {

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    }


    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    const price = product.pricing?.[plan];

    if (!price || price <= 0) {

      return res.status(400).json({
        success: false,
        message: "Invalid pricing",
      });

    }


    // --------------------------------------------------------
    // BASE URL
    // --------------------------------------------------------

    const BASE_URL =
      process.env.BASE_URL ||
      "https://codecarthub.com";


    // --------------------------------------------------------
    // UNIQUE REFERENCE
    // --------------------------------------------------------

    const reference =
      `CCH_${Date.now()}_${crypto
        .randomBytes(6)
        .toString("hex")}`;


    // --------------------------------------------------------
    // INITIALIZE PAYSTACK TRANSACTION
    // --------------------------------------------------------

    const transaction = await paystackRequest(
      "/transaction/initialize",
      {
        method: "POST",

        body: JSON.stringify({

          email: user.email,

          // Paystack expects the amount in the
          // currency's smallest unit.
          amount: Math.round(price * 100),

          currency: "GHS",

          reference,

          callback_url:
             `${BASE_URL}/api/payments/callback`,

          metadata: {

            userId: user._id.toString(),

            productId:
              product._id.toString(),

            plan,

          },

        }),
      }
    );


    console.log(
      "✅ Paystack transaction initialized:",
      transaction.data.reference
    );


    // --------------------------------------------------------
    // RETURN CHECKOUT URL
    // --------------------------------------------------------

    return res.json({

      success: true,

      url:
        transaction.data.authorization_url,

      reference:
        transaction.data.reference,

    });


  } catch (error) {

    console.error(
      "❌ Paystack checkout error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Paystack checkout failed",

    });

  }

};


// ============================================================
// PAYSTACK CALLBACK
// ============================================================

export const paystackCallback = async (
  req: Request,
  res: Response
) => {

  try {

    const reference =
      req.query.reference as string;


    if (!reference) {

      return res.redirect(
        "/cancel.html"
      );

    }


    console.log(
      "🔎 Verifying Paystack transaction:",
      reference
    );


    // --------------------------------------------------------
    // VERIFY TRANSACTION
    // --------------------------------------------------------

    const verification =
      await paystackRequest(
        `/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method: "GET",
        }
      );


    const transaction =
      verification.data;


    if (transaction.status !== "success") {

      console.warn(
        "❌ Payment not successful:",
        transaction.status
      );

      return res.redirect(
        "/cancel.html"
      );

    }


    // --------------------------------------------------------
    // PROCESS PAYMENT
    // --------------------------------------------------------

    await processSuccessfulPayment(
      transaction
    );


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.redirect(
      "/success.html"
    );


  } catch (error) {

    console.error(
      "❌ Paystack callback error:",
      error
    );

    return res.redirect(
      "/cancel.html"
    );

  }

};


// ============================================================
// PAYSTACK WEBHOOK
// ============================================================

export const paystackWebhook = async (
  req: Request,
  res: Response
) => {

  try {
    console.log(
      "Webhook body type:",
      Buffer.isBuffer(req.body)
    );

    const signature =
      req.headers["x-paystack-signature"];


    if (!signature) {

      console.error(
        "❌ Missing Paystack signature"
      );

      return res.status(400).send(
        "Missing signature"
      );

    }


    // --------------------------------------------------------
    // VERIFY WEBHOOK SIGNATURE
    // --------------------------------------------------------

    const hash =
      crypto
        .createHmac(
          "sha512",
          paystackSecretKey
        )
        .update(req.body)
        .digest("hex");


    if (hash !== signature) {

      console.error(
        "❌ Invalid Paystack webhook signature"
      );

      return res.status(400).send(
        "Invalid signature"
      );

    }


    const event =
      JSON.parse(req.body.toString());


    console.log(
      "📩 Paystack webhook:",
      event.event
    );


    // --------------------------------------------------------
    // PAYMENT SUCCESS
    // --------------------------------------------------------

    if (
      event.event ===
      "charge.success"
    ) {

      await processSuccessfulPayment(
        event.data
      );

    }


    return res.status(200).json({
      received: true,
    });


  } catch (error: any) {

    console.error(
      "❌ Paystack webhook error:",
      error
    );

    return res.status(500).json({
      received: false,
    });

  }

};


// ============================================================
// PROCESS SUCCESSFUL PAYMENT
// ============================================================

const processSuccessfulPayment = async (
  transaction: any
) => {

  // ----------------------------------------------------------
  // METADATA
  // ----------------------------------------------------------

  const metadata =
    transaction.metadata || {};


  const {
    userId,
    productId,
    plan,
  } = metadata;


  if (
    !userId ||
    !productId ||
    !plan
  ) {

    throw new Error(
      "Missing metadata in Paystack transaction"
    );

  }


  // ----------------------------------------------------------
  // VALIDATE PLAN
  // ----------------------------------------------------------

  if (
    !validPlans.includes(
      plan as PlanType
    )
  ) {

    throw new Error(
      "Invalid plan type"
    );

  }


  // ----------------------------------------------------------
  // FETCH USER + PRODUCT
  // ----------------------------------------------------------

  const user =
    await User.findById(userId);

  const product =
    await Product.findById(productId);


  if (!user || !product) {

    throw new Error(
      "User or product not found"
    );

  }


  // ----------------------------------------------------------
  // VERIFY PAYMENT AMOUNT + CURRENCY
  // ----------------------------------------------------------

  const expectedAmount =
    Math.round((product.pricing?.[plan as PlanType] ?? 0) * 100);

  if (transaction.amount !== expectedAmount) {
    throw new Error("Payment amount mismatch");
  }

  if (transaction.currency !== "GHS") {
    throw new Error("Payment currency mismatch");
  }

  // VERIFY PAYMENT EMAIL

  if (
    transaction.customer?.email &&
    transaction.customer.email.toLowerCase() !==
      user.email.toLowerCase()
  ) {
    throw new Error("Payment email mismatch");
  }

    // ----------------------------------------------------------
    // PREVENT DUPLICATE FULFILLMENT
    // ----------------------------------------------------------

    if (plan === "sourceCode") {

      const existingDownload =
        await DownloadLink.findOne({
          paymentReference:
            transaction.reference,
        });

      if (existingDownload) {

        console.log(
          "ℹ️ Source code payment already fulfilled:",
          transaction.reference
        );

        return;

      }

    }


    if (
      plan === "assistedSetup" ||
      plan === "doneForYou"
    ) {

      const existingServiceOrder =
        await ServiceOrder.findOne({
          paymentReference:
            transaction.reference,
        });

      if (existingServiceOrder) {

        console.log(
          "ℹ️ Service order already fulfilled:",
          transaction.reference
        );

        return;

      }

    }


  // ----------------------------------------------------------
  // BASE URL
  // ----------------------------------------------------------

  const BASE_URL =
    process.env.BASE_URL ||
    "https://codecarthub.com";


  // ----------------------------------------------------------
  // SOURCE CODE PLAN
  // ----------------------------------------------------------

  if (plan === "sourceCode") {

    // CREATE DOWNLOAD RECORD

    const downloadLink =
      await DownloadLink.create({

        user: user._id,

        product: product._id,

        plan,

        url: "",

        maxDownloads: 3,

        successfulDownloads: 0,

        expiresAt:
          new Date(
            Date.now() +
            48 * 60 * 60 * 1000
          ),

        paymentReference:
          transaction.reference,

      });


    // CREATE SECURE DOWNLOAD URL

    const downloadUrl =
      `${BASE_URL}/downloads/${downloadLink._id}`;


    downloadLink.url =
      downloadUrl;


    await downloadLink.save();


    // SEND DOWNLOAD EMAIL

    await sendDownloadLinkEmail(
      user.email,
      downloadUrl,
      product.name,
      plan
    );

  }
    else if (
      plan === "assistedSetup" ||
      plan === "doneForYou"
    ) {

      // CREATE SERVICE ORDER

      await ServiceOrder.create({

        user: user._id,

        product: product._id,

        plan,

        paymentReference:
          transaction.reference,

        paymentStatus: "paid",

        status: "pending",

      });


      // SEND DASHBOARD EMAIL

      await sendDashboardLinkEmail(
        user.email,
        product.name,
        plan
      );

    }

  console.log(
    `💰 Paystack payment fulfilled: ${transaction.reference}`
  );

};