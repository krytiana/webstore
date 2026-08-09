// src/controllers/stripeController.ts
import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import { Cart } from "../models/cart";
import Order from "../models/Order";
import crypto from "crypto";
import Address from "../models/address";

// ----------------------------
// Cart-based checkout
// ----------------------------
export const createCartCheckoutSession = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    // Fetch user's cart and populate product details
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Type assertion: tell TS each item.productId is populated
    const cartItems = cart.items.map(item => item as any);

    // Map cart items to Stripe line items
    const line_items = cartItems.map(item => {
      const product = item.productId;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel.html`,
      metadata: {
        userId: userId.toString(),
      },
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe cart checkout error:", err);
    res.status(500).json({ success: false, message: "Stripe checkout failed" });
  }
};


// ----------------------------
// Verify successful payment
// Create order manually
// ----------------------------
export const verifyStripeSuccess = async (
  req: any,
  res: Response
) => {
  try {

    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Missing session ID"
      });
    }

    // Verify Stripe session
    const session =
      await stripe.checkout.sessions.retrieve(
        session_id
      );

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed"
      });
    }

    const userId = session.metadata?.userId;

    // Prevent duplicate orders
    const existingOrder = await Order.findOne({
      stripeSessionId: session.id
    });

    if (existingOrder) {
      return res.json({
        success: true,
        order: existingOrder
      });
    }

    // Get cart
    const cart = await Cart.findOne({
      userId
    }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const cartItems = cart.items.map(
      item => item as any
    );

    // Build order items
    const orderItems = cartItems.map(item => {
      const product = item.productId;

      return {
        product: product._id,

        name: product.name,

        price: product.price,

        image: product.images?.[0] || "",

        quantity: item.quantity,

        selectedOptions:
          item.selectedOptions || {}
      };
    });

    const totalAmount = orderItems.reduce(
      (acc, item) =>
        acc + item.price * item.quantity,
      0
    );

    const orderNumber =
      "FF-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      crypto.randomBytes(4).toString("hex").toUpperCase();

    // Get user's addresses
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

    // Create order
    const order = await Order.create({
      user: userId,

      items: orderItems,

      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        region: address.region,
        country: address.country
      },

      totalAmount,

      paymentProvider: "stripe",

      stripeSessionId: session.id,

      paymentStatus: "paid",

      orderStatus: "confirmed",

      orderNumber,

      trackingHistory: [
        {
          status: "confirmed",
          message: "Order placed successfully",
          updatedAt: new Date(),
        }
      ]
    });
    

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error("Verify payment error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to verify payment"
    });
  }
};


// ----------------------------
// Stripe webhook for order creation
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

    try {
      const userId = session.metadata.userId;

      // Fetch cart and populate products
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      if (!cart) throw new Error("Cart not found");

      const cartItems = cart.items.map(item => item as any);

      // Map cart items to order items
      const orderItems = cartItems.map(item => {
        const product = item.productId;
        return {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || {}
        };
      });

      const totalAmount = orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const orderNumber =
        "FF-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        crypto.randomBytes(4).toString("hex").toUpperCase();

      const existingOrder = await Order.findOne({
        stripeSessionId: session.id
      });

      if (existingOrder) {
        return res.status(200).json({
          received: true
        });
      }

      // Get user's addresses
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

    // Create order
    const order = await Order.create({
      user: userId,

      items: orderItems,

      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        region: address.region,
        country: address.country
      },

      totalAmount,

      paymentProvider: "stripe", 

      stripeSessionId: session.id,

      paymentStatus: "paid",

      orderStatus: "confirmed",

      orderNumber,

      trackingHistory: [
        {
          status: "confirmed",
          message: "Order placed successfully",
          updatedAt: new Date(),
        }
      ]
    });
      // Clear cart
      cart.items = [];
      await cart.save();

    } catch (err) {
      console.error("❌ Error creating order from webhook:", err);
    }
  }

  res.status(200).json({ received: true });
};