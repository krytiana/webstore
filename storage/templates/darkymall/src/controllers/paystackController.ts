// src/controllers/paystackController.ts

import { Request, Response } from "express";
import crypto from "crypto";

import { Cart } from "../models/cart";
import Order from "../models/Order";
import Address from "../models/address";

const PAYSTACK_SECRET =
  process.env.PAYSTACK_SECRET_KEY || "";


// =====================================================
// Create Paystack Checkout
// =====================================================

export const createPaystackCheckout = async (
  req: any,
  res: Response
) => {

  try {

    const userId = req.user.userId;

    // ---------------------------------------------
    // Get cart
    // ---------------------------------------------

    const cart = await Cart.findOne({
      userId
    }).populate("items.productId");

    if (!cart || cart.items.length === 0) {

      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });

    }


    // ---------------------------------------------
    // Get user's default address
    // ---------------------------------------------

    const address = await Address.findOne({
      userId,
      isDefault: true
    });

    if (!address) {

      return res.status(400).json({
        success: false,
        message: "No default address found"
      });

    }


    // ---------------------------------------------
    // Build cart items
    // ---------------------------------------------

    const cartItems = cart.items.map(
      item => item as any
    );


    // ---------------------------------------------
    // Calculate total on SERVER
    // ---------------------------------------------

    const totalAmount = cartItems.reduce(
      (total, item) => {

        const product = item.productId;

        return total +
          product.price * item.quantity;

      },
      0
    );


    if (totalAmount <= 0) {

      return res.status(400).json({
        success: false,
        message: "Invalid cart amount"
      });

    }


    // ---------------------------------------------
    // Get user email
    // ---------------------------------------------

    const email =
      req.user.email;

    if (!email) {

      return res.status(400).json({
        success: false,
        message: "User email is required"
      });

    }


    // ---------------------------------------------
    // Unique reference
    // ---------------------------------------------

    const reference =
      `PAY-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")}`;


    // ---------------------------------------------
    // Callback URL
    // ---------------------------------------------

    const baseUrl =
      `${req.protocol}://${req.get("host")}`;

    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${baseUrl}/api/paystack/callback`;


    // ---------------------------------------------
    // Initialize Paystack
    // ---------------------------------------------

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${PAYSTACK_SECRET}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          amount:
            Math.round(totalAmount * 100),

          email,

          currency: "GHS",

          reference,

          callback_url:
            callbackUrl,

          metadata: {
            userId:
              userId.toString(),

            reference,

            fullname:
              address.fullName,

            phone:
              address.phone
          }

        })
      }
    );


    const result: any =
      await response.json();


    if (!result.status) {

      console.error(
        "Paystack initialization failed:",
        result
      );

      return res.status(400).json({
        success: false,
        message:
          result.message ||
          "Paystack initialization failed"
      });

    }


    // ---------------------------------------------
    // Return checkout URL
    // ---------------------------------------------

    return res.json({

      success: true,

      authorization_url:
        result.data.authorization_url,

      access_code:
        result.data.access_code,

      reference:
        result.data.reference

    });

  } catch (error) {

    console.error(
      "Paystack checkout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Paystack checkout failed"
    });

  }

};

// =====================================================
// Verify Paystack Payment
// =====================================================

export const verifyPaystackPayment = async (
  req: any,
  res: Response
) => {

  try {

    const reference =
      req.query.reference as string;


    if (!reference) {

      return res.redirect(
        "/success.html?payment=paystack&status=failed&message=Missing%20payment%20reference"
      );

    }


    // ---------------------------------------------
    // Verify payment with Paystack
    // ---------------------------------------------

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );


    const result: any =
      await response.json();


    if (
      !result.status ||
      result.data?.status !== "success"
    ) {

      return res.redirect(
        `/success.html?payment=paystack&status=failed&reference=${encodeURIComponent(reference)}`
      );

    }


    const payment =
      result.data;


    // ---------------------------------------------
    // Get user from metadata
    // ---------------------------------------------

    const userId =
      payment.metadata?.userId;


    if (!userId) {

      return res.redirect(
        `/success.html?payment=paystack&status=failed&reference=${encodeURIComponent(reference)}`
      );

    }


    // ---------------------------------------------
    // Prevent duplicate order
    // ---------------------------------------------

    const existingOrder =
      await Order.findOne({
        paystackReference:
          payment.reference
      });


    if (existingOrder) {

      return res.redirect(
        `/success.html?payment=paystack&status=success&reference=${encodeURIComponent(reference)}`
      );

    }


    // ---------------------------------------------
    // Get cart
    // ---------------------------------------------

    const cart =
      await Cart.findOne({
        userId
      }).populate(
        "items.productId"
      );


    if (!cart || cart.items.length === 0) {

      return res.redirect(
        `/success.html?payment=paystack&status=failed&reference=${encodeURIComponent(reference)}`
      );

    }


    const cartItems =
      cart.items.map(
        item => item as any
      );


    // ---------------------------------------------
    // Build order items
    // ---------------------------------------------

    const orderItems =
      cartItems.map(item => {

        const product =
          item.productId;

        return {

          product:
            product._id,

          name:
            product.name,

          price:
            product.price,

          image:
            product.images?.[0] || "",

          quantity:
            item.quantity,

          selectedOptions:
            item.selectedOptions || {}

        };

      });


    // ---------------------------------------------
    // Calculate total
    // ---------------------------------------------

    const totalAmount =
      orderItems.reduce(
        (acc, item) =>
          acc +
          item.price *
          item.quantity,
        0
      );


    // ---------------------------------------------
    // Verify paid amount
    // ---------------------------------------------

    const paidAmount =
      payment.amount / 100;


    if (
      Math.round(paidAmount * 100) !==
      Math.round(totalAmount * 100)
    ) {

      console.error(
        "Paystack amount mismatch",
        {
          paidAmount,
          totalAmount,
          reference:
            payment.reference
        }
      );


      return res.redirect(
        `/success.html?payment=paystack&status=failed&reference=${encodeURIComponent(reference)}`
      );

    }


    // ---------------------------------------------
    // Get default address
    // ---------------------------------------------

    const address =
      await Address.findOne({
        userId,
        isDefault: true
      });


    if (!address) {

      return res.redirect(
        `/success.html?payment=paystack&status=failed&reference=${encodeURIComponent(reference)}`
      );

    }


    // ---------------------------------------------
    // Generate order number
    // ---------------------------------------------

    const orderNumber =
      "FF-" +
      Date.now()
        .toString(36)
        .toUpperCase() +
      "-" +
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();


    // ---------------------------------------------
    // Create order
    // ---------------------------------------------

    await Order.create({

      user:
        userId,

      items:
        orderItems,

      shippingAddress: {

        fullName:
          address.fullName,

        phone:
          address.phone,

        addressLine:
          address.addressLine,

        city:
          address.city,

        region:
          address.region,

        country:
          address.country

      },

      totalAmount,

      paymentProvider:
        "paystack",

      paystackReference:
        payment.reference,

      paymentStatus:
        "paid",

      orderStatus:
        "confirmed",

      orderNumber,

      trackingHistory: [

        {

          status:
            "confirmed",

          message:
            "Order placed successfully",

          updatedAt:
            new Date()

        }

      ]

    });


    // ---------------------------------------------
    // Clear cart
    // ---------------------------------------------

    cart.items = [];

    await cart.save();


    // ---------------------------------------------
    // Redirect to success page
    // ---------------------------------------------

    return res.redirect(
      `/success.html?payment=paystack&status=success&reference=${encodeURIComponent(reference)}`
    );


  } catch (error) {

    console.error(
      "Paystack verification error:",
      error
    );


    return res.redirect(
      "/success.html?payment=paystack&status=failed"
    );

  }

};


// =====================================================
// Paystack Webhook
// =====================================================

export const paystackWebhook = async (
  req: Request,
  res: Response
) => {

  try {

    const signature =
      req.headers[
        "x-paystack-signature"
      ] as string;


    // ---------------------------------------------
    // Verify webhook signature
    // ---------------------------------------------

    const hash =
      crypto
        .createHmac(
          "sha512",
          PAYSTACK_SECRET
        )
        .update(
          JSON.stringify(req.body)
        )
        .digest("hex");


    if (hash !== signature) {

      console.error(
        "Invalid Paystack webhook signature"
      );

      return res
        .status(401)
        .send("Invalid signature");

    }


    const event =
      req.body;


    // ---------------------------------------------
    // Only process successful charges
    // ---------------------------------------------

    if (
      event.event !==
      "charge.success"
    ) {

      return res.status(200).json({
        received: true
      });

    }


    const payment =
      event.data;


    const reference =
      payment.reference;


    // ---------------------------------------------
    // Prevent duplicate order
    // ---------------------------------------------

    const existingOrder =
      await Order.findOne({
        paystackReference:
          reference
      });


    if (existingOrder) {

      return res.status(200).json({
        received: true
      });

    }


    const userId =
      payment.metadata?.userId;


    if (!userId) {

      console.error(
        "No userId in Paystack metadata"
      );

      return res.status(200).json({
        received: true
      });

    }


    // ---------------------------------------------
    // Get cart
    // ---------------------------------------------

    const cart =
      await Cart.findOne({
        userId
      }).populate(
        "items.productId"
      );


    if (!cart || cart.items.length === 0) {

      console.log(
        "Cart not found or already cleared"
      );

      return res.status(200).json({
        received: true
      });

    }


    const cartItems =
      cart.items.map(
        item => item as any
      );


    // ---------------------------------------------
    // Build order items
    // ---------------------------------------------

    const orderItems =
      cartItems.map(item => {

        const product =
          item.productId;

        return {

          product:
            product._id,

          name:
            product.name,

          price:
            product.price,

          image:
            product.images?.[0] || "",

          quantity:
            item.quantity,

          selectedOptions:
            item.selectedOptions || {}

        };

      });


    const totalAmount =
      orderItems.reduce(
        (acc, item) =>
          acc +
          item.price *
          item.quantity,
        0
      );


    // ---------------------------------------------
    // Verify amount
    // ---------------------------------------------

    const paidAmount =
      payment.amount / 100;


    if (
      Math.round(paidAmount * 100) !==
      Math.round(totalAmount * 100)
    ) {

      console.error(
        "Webhook amount mismatch",
        {
          paidAmount,
          totalAmount,
          reference
        }
      );

      return res.status(200).json({
        received: true
      });

    }


    // ---------------------------------------------
    // Address
    // ---------------------------------------------

    const address =
      await Address.findOne({
        userId,
        isDefault: true
      });


    if (!address) {

      console.error(
        "No default address found"
      );

      return res.status(200).json({
        received: true
      });

    }


    // ---------------------------------------------
    // Generate order number
    // ---------------------------------------------

    const orderNumber =
      "FF-" +
      Date.now()
        .toString(36)
        .toUpperCase() +
      "-" +
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();


    // ---------------------------------------------
    // Create order
    // ---------------------------------------------

    await Order.create({

      user:
        userId,

      items:
        orderItems,

      shippingAddress: {

        fullName:
          address.fullName,

        phone:
          address.phone,

        addressLine:
          address.addressLine,

        city:
          address.city,

        region:
          address.region,

        country:
          address.country

      },

      totalAmount,

      paymentProvider:
        "paystack",

      paystackReference:
        reference,

      paymentStatus:
        "paid",

      orderStatus:
        "confirmed",

      orderNumber,

      trackingHistory: [

        {

          status:
            "confirmed",

          message:
            "Order placed successfully",

          updatedAt:
            new Date()

        }

      ]

    });


    // ---------------------------------------------
    // Clear cart
    // ---------------------------------------------

    cart.items = [];

    await cart.save();


    return res.status(200).json({
      received: true
    });


  } catch (error) {

    console.error(
      "Paystack webhook error:",
      error
    );

    return res.status(200).json({
      received: true
    });

  }

};