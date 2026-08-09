// src/controllers/cartController.ts
import { Request, Response } from "express";
import { Cart } from "../models/cart";
import { Settings } from "../models/Settings";

/**
 * Normalize options so order of keys does not affect comparison
 */
function normalizeOptions(options: any) {

  // HANDLE null / undefined
  if (!options || typeof options !== "object") {
    options = {};
  }

  return JSON.stringify(
    Object.keys(options)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = options[key];
        return acc;
      }, {})
  );
}

// ------------------------
// ADD TO CART
// ------------------------
export const addToCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity, selectedOptions = {} } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, selectedOptions }]
      });
    } else {
      const itemIndex = cart.items.findIndex((item: any) =>
        item.productId.toString() === productId &&
        normalizeOptions(item.selectedOptions) === normalizeOptions(selectedOptions)
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          selectedOptions
        });
      }

      await cart.save();
    }

    res.json({ success: true });

  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false });
  }
};

// ------------------------
// GET CART
// ------------------------
export const getCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId })
      .populate("items.productId");

    res.json({
      success: true,
      cart
    });

  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart"
    });
  }
};

// ------------------------
// REMOVE FROM CART
// ------------------------
export const removeFromCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const {
      productId,
      selectedOptions = {}
    } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ success: false });
    }

    cart.items = cart.items.filter((item: any) =>
      !(
        item.productId.toString() === productId &&
        normalizeOptions(item.selectedOptions) === normalizeOptions(selectedOptions)
      )
    ) as any;

    await cart.save();

    res.json({
      success: true,
      cart
    });

  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false });
  }
};

// ------------------------
// UPDATE CART (qty + remove)
// ------------------------
export const updateCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const {
      productId,
      selectedOptions = {},
      change
    } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(400).json({ success: false });
    }

    const itemIndex = cart.items.findIndex((i: any) =>
      i.productId.toString() === productId &&
      normalizeOptions(i.selectedOptions) === normalizeOptions(selectedOptions)
    );

    if (itemIndex === -1) {
      return res.status(400).json({ success: false });
    }

    // Remove item completely
    if (change === -9999) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity += change;

      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }

    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    res.json({
      success: true,
      cart: populatedCart
    });

  } catch (err) {
    console.error("updateCart error:", err);
    res.status(500).json({ success: false });
  }
};

// ------------------------
// CART PAGE RENDER
// ------------------------
export const renderCartPage = async (req: any, res: Response) => {
  try {
    let settings = await Settings.findOne({});

    if (!settings) {
      settings = await Settings.create({});
    }

    res.render("cart", { settings });

  } catch (err) {
    console.error("renderCartPage error:", err);
    res.status(500).send("Server error");
  }
};