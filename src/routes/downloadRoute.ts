// src/routes/downloadRoute.ts
import express from "express";
import path from "path";
import DownloadLink from "../models/DownloadLink";

import fs from "fs";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find by ID (secure)
    const link = await DownloadLink.findById(id).populate("product");
    if (!link) return res.status(404).send("Invalid download link");

    // ✅ Check expiry
    if (link.expiresAt < new Date())
      return res.status(403).send("Link expired");

    // ✅ Check download limit
    if (link.successfulDownloads >= link.maxDownloads)
      return res.status(403).send("Download limit reached");

    const product = link.product as any;

    // ✅ Secure file path (NOT public)
    const filePath = path.join(
      __dirname,
      "../../storage/downloads",
      `${product.slug}.zip`
    );

    // ✅ Increment download count BEFORE sending
    link.successfulDownloads += 1;
    await link.save();

    console.log("⬇️ Secure download:", filePath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found on server");
    }
    // ✅ Send file (NO redirect)
    res.download(filePath);

  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).send("Server error");
  }
});

export default router;