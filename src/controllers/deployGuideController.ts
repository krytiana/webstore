import { Request, Response } from "express";
import Product from "../models/ProductModel";

export const showDeployGuide = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).render("404");
    }

    res.render("deploy-guide", {
      title: `${product.name} Deployment Guide`,
      product,
      githubRepoUrl: req.session.githubRepoUrl
    });

  } catch (error) {
    console.error(error);

    res.status(500).send(
      "Server Error"
    );
  }
};