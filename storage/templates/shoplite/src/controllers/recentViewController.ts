import { Response } from "express";
import { RecentView } from "../models/recentView";

export const addRecentView = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    let recent = await RecentView.findOne({ userId });

    if (!recent) {
      recent = await RecentView.create({
        userId,
        items: [{ productId }]
      });
    } else {
      // ✅ Remove existing item (no duplicates)
      const existingItem = recent.items.find(
        (i: any) => i.productId.toString() === productId
      );

      if (existingItem) {
        recent.items.pull(existingItem);
      }

      // ✅ Add new item to the beginning
      recent.items.unshift({ productId } as any);

      // ✅ Limit to 10 items (IMPORTANT FIX)
      while (recent.items.length > 10) {
        recent.items.pop(); // removes last item safely
      }

      await recent.save();
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


export const getRecentViews = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const recent = await RecentView.findOne({ userId })
      .populate("items.productId");

    res.json({ success: true, recent });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};