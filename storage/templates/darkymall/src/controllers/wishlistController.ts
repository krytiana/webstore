// src/controllers/wishlistController.ts
import { Request, Response } from "express";
import { Wishlist } from "../models/wishlist";

export const getWishlist = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    let wishlist = await Wishlist.findOne({ userId }).populate("items.productId");
    if (!wishlist) wishlist = await Wishlist.create({ userId, items: [] });

    res.json({ success: true, wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const addToWishlist = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId, size, color } = req.body;

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [{ productId, size, color }] });
    } else {
      const exists = wishlist.items.find(
        (i: any) =>
          i.productId.toString() === productId &&
          i.size === size &&
          i.color === color
      );

      if (!exists) wishlist.items.push({ productId, size, color });

      await wishlist.save();
    }

    res.json({ success: true, wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const removeFromWishlist = async (
  req: any,
  res: Response
) => {

  try {

    const userId = req.user.userId;

    const {
      productId,
      size = null,
      color = null
    } = req.body;

    const wishlist = await Wishlist.findOne({
      userId
    });

    if (!wishlist) {
      return res.json({
        success: false
      });
    }

    wishlist.items = wishlist.items.filter(
      (item: any) =>
        !(
          item.productId.toString() === productId &&
          (item.size || null) === size &&
          (item.color || null) === color
        )
    ) as any;

    await wishlist.save();

    res.json({
      success: true,
      wishlist
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
};