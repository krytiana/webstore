import { Response } from "express";
import { getImageKit } from "../config/imagekit";
function isSupportedImage(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === "image/gif") return ["GIF87a","GIF89a"].includes(buffer.subarray(0,6).toString("ascii"));
  if (mime === "image/webp") return buffer.subarray(0,4).toString("ascii") === "RIFF" && buffer.subarray(8,12).toString("ascii") === "WEBP";
  return false;
}
export const uploadImage = async (req: any, res: Response) => {
  try {
    const file = req.file; if (!file) return res.status(400).json({ success:false, message:"No file uploaded" });
    if (!isSupportedImage(file.buffer, file.mimetype)) return res.status(400).json({ success:false, message:"Unsupported or invalid image file" });
    const safeBaseName = String(file.originalname || "image").replace(/[^a-zA-Z0-9._-]/g,"-").slice(0,80) || "image";
    const result = await getImageKit().upload({ file:file.buffer, fileName:`${Date.now()}-${safeBaseName}`, folder:"/products", useUniqueFileName:true });
    return res.json({ success:true, url:result.url });
  } catch (err) { console.error("Image upload error:",err); return res.status(500).json({ success:false, message:"Upload failed" }); }
};
