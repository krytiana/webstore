import { Response } from "express";
import { Cart } from "../models/cart";
import { Product } from "../models/Product";
import { Settings } from "../models/Settings";

function normalizeOptions(options: unknown) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return "{}";
  }

  const clean = Object.entries(options as Record<string, unknown>)
    .filter(([key, value]) => typeof key === "string" && typeof value === "string")
    .slice(0, 20)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key.slice(0, 50)] = String(value).slice(0, 100);
      return acc;
    }, {});

  return JSON.stringify(clean);
}

function parseQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return null;
  }
  return quantity;
}

async function validateProduct(productId: string) {
  if (!/^[a-f\d]{24}$/i.test(productId)) return null;
  return Product.findById(productId);
}

export const addToCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId, selectedOptions = {} } = req.body;
    const quantity = parseQuantity(req.body.quantity);

    if (!quantity || typeof productId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity",
      });
    }

    const product = await validateProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, selectedOptions }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item: any) =>
          item.productId.toString() === productId &&
          normalizeOptions(item.selectedOptions) === normalizeOptions(selectedOptions)
      );

      if (itemIndex > -1) {
        const nextQuantity = cart.items[itemIndex].quantity + quantity;
        if (nextQuantity > 100) {
          return res.status(400).json({
            success: false,
            message: "Maximum quantity per item is 100",
          });
        }
        cart.items[itemIndex].quantity = nextQuantity;
      } else {
        if (cart.items.length >= 100) {
          return res.status(400).json({
            success: false,
            message: "Cart item limit reached",
          });
        }
        cart.items.push({
          productId,
          quantity,
          selectedOptions,
        });
      }

      await cart.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to add product to cart",
    });
  }
};

export const getCart = async (req: any, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId })
      .populate("items.productId")
      .lean();

    res.json({
      success: true,
      cart: cart || { items: [] },
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { productId, selectedOptions = {} } = req.body;

    if (typeof productId !== "string") {
      return res.status(400).json({ success: false, message: "Invalid product" });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }

    cart.items = cart.items.filter(
      (item: any) =>
        !(
          item.productId.toString() === productId &&
          normalizeOptions(item.selectedOptions) === normalizeOptions(selectedOptions)
        )
    ) as any;

    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(400).json({ success: false });
  }
};

export const updateCart = async (req: any, res: Response) => {
  try {
    const { productId, selectedOptions = {}, change } = req.body;
    const delta = Number(change);
    const isRemove = delta === -9999;

    if (
      typeof productId !== "string" ||
      !Number.isInteger(delta) ||
      (!isRemove && Math.abs(delta) > 100)
    ) {
      return res.status(400).json({ success: false, message: "Invalid cart update" });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) =>
        item.productId.toString() === productId &&
        normalizeOptions(item.selectedOptions) === normalizeOptions(selectedOptions)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    if (delta === -9999) {
      cart.items.splice(itemIndex, 1);
    } else {
      const nextQuantity = cart.items[itemIndex].quantity + delta;

      if (nextQuantity > 100) {
        return res.status(400).json({
          success: false,
          message: "Maximum quantity per item is 100",
        });
      }

      if (nextQuantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = nextQuantity;
      }
    }

    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    res.json({ success: true, cart: populatedCart });
  } catch (err) {
    console.error("updateCart error:", err);
    res.status(400).json({ success: false });
  }
};

export const renderCartPage = async (_req: any, res: Response) => {
  try {
    const settingsDoc = await Settings.findOne({});
    const settings = settingsDoc ? settingsDoc.toObject() : (await Settings.create({})).toObject();

    res.render("cart", { settings });
  } catch (err) {
    console.error("renderCartPage error:", err);
    res.status(500).send("Server error");
  }
};
