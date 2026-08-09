// src/routes/testZipRoute.ts

import { Router, Request, Response } from "express";
import Product from "../models/ProductModel";
import { createTemplateZip } from "../utils/templateZip";

const router = Router();

router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slugParam = req.params.slug;

    // Make sure slug is a single string
    if (Array.isArray(slugParam)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product slug",
      });
    }

    const slug = slugParam.trim().toLowerCase();

    console.log("🔎 Looking for product slug:", slug);

    const product = await Product.findOne({ slug });

    console.log("🔎 Product found:", product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        searchedSlug: slug,
      });
    }

    if (!product.slug) {
      return res.status(400).json({
        success: false,
        message: "Product has no slug",
      });
    }

    if (!product.templatePath) {
      return res.status(400).json({
        success: false,
        message: "Product has no templatePath",
      });
    }

    const zipPath = await createTemplateZip({
      slug: product.slug,
      templatePath: product.templatePath,
    });

    console.log("✅ ZIP created:", zipPath);

    return res.json({
      success: true,
      product: product.name,
      slug: product.slug,
      templatePath: product.templatePath,
      zipPath,
    });

  } catch (error) {
    console.error("❌ ZIP test error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

export default router;