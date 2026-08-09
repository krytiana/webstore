import { Router, Request, Response } from "express";
import Product from "../models/ProductModel";
import { getTemplateDirectory } from "../utils/templateStorage";

const router = Router();

router.get("/test-template/:slug", async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const templateDirectory = getTemplateDirectory(product);

    return res.json({
      success: true,
      product: product.name,
      templatePath: product.templatePath,
      templateDirectory,
    });
  } catch (error: any) {
    console.error("Template test error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;