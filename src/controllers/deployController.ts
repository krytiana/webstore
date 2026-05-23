// src/controllers/deployController.ts
import { Request, Response } from "express";
import Product from "../models/ProductModel";
import { title } from "process";

export const showDeployPage = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).render("404");
    }

    res.render("deploy", {
      title: `Deploy ${product.name}`,
      product,
      github: req.session.github,
        githubRepoUrl: req.session.githubRepoUrl
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};