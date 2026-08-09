import { Request, Response } from "express";
import imagekit from "../config/imagekit";

export const uploadImage = async (req: any, res: Response) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
    });

    res.json({
      success: true,
      url: result.url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};