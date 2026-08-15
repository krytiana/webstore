// src/controllers/deployController.ts
import { Request, Response } from "express";
import Product from "../models/ProductModel";

export const showDeployPage = async (
  req: Request,
  res: Response
) => {
  try {
    const productId = req.params.productId as string;

    // ---------------------------------------
    // 1. Find product
    // ---------------------------------------
    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).render("404");
    }

    // ---------------------------------------
    // 2. Detect a new product deployment
    // ---------------------------------------
    const previousProductId =
      req.session.currentProductId;

    if (
      previousProductId &&
      previousProductId !== productId
    ) {


      // Keep GitHub connection
      // but reset deployment-specific state.

      req.session.githubRepoUrl =
        undefined;

      req.session.githubRepoName =
        undefined;

      req.session.sourceCodePushed =
        false;
    }

    // ---------------------------------------
    // 3. Set current product
    // ---------------------------------------
    req.session.currentProductId =
      productId;

    // ---------------------------------------
    // 4. Render deployment page
    // ---------------------------------------
    return res.render("deploy", {
      title: `Deploy ${product.name}`,
      product,

      github:
        req.session.github,

      githubRepoUrl:
        req.session.githubRepoUrl,

      sourceCodePushed:
        req.session.sourceCodePushed
    });

  } catch (error) {

    console.error(
      "❌ Deployment page error:",
      error
    );

    return res.status(500).send(
      "Server Error"
    );
  }
};