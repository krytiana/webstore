// src/controllers/deployGuideController.ts

import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Product from "../models/ProductModel";
import {classifyEnvVariables} from "../utils/envRequirements";

export const showDeployGuide = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.params;

    // ---------------------------------------
    // 1. Find product
    // ---------------------------------------
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).render("404");
    }

    // ---------------------------------------
    // 2. Validate template path
    // ---------------------------------------
    if (!product.templatePath) {
      return res.status(400).send(
        "This product does not have a template configured."
      );
    }

    // ---------------------------------------
    // 3. Locate template directory
    // ---------------------------------------
    const templateDirectory = path.join(
      process.cwd(),
      "storage",
      "templates",
      product.templatePath
    );


    // ---------------------------------------
    // 4. Locate .env.example
    // ---------------------------------------
    const envExamplePath = path.join(
      templateDirectory,
      ".env.example"
    );

    if (!fs.existsSync(envExamplePath)) {
      console.error(
        "❌ .env.example not found:",
        envExamplePath
      );

      return res.status(404).send(
        "This template does not have an environment configuration."
      );
    }

    // ---------------------------------------
    // 5. Read .env.example
    // ---------------------------------------
    const envContent = await fs.promises.readFile(
      envExamplePath,
      "utf-8"
    );

    // ---------------------------------------
    // 6. Extract environment variables
    // ---------------------------------------
    const envVariables = envContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => {
        return (
          line &&
          !line.startsWith("#") &&
          line.includes("=")
        );
      })
      .map((line) => {
        const [name] = line.split("=");

        return name.trim();
      })
      .filter(Boolean);

    const envRequirements =
      classifyEnvVariables(envVariables);

    // ---------------------------------------
    // 7. Render deployment guide
    // ---------------------------------------
    return res.render("deploy-guide", {
      title: `${product.name} Deployment Guide`,
      product,
      githubRepoUrl: req.session.githubRepoUrl,
      envVariables,
      envRequirements,
    });

  } catch (error) {
    console.error(
      "❌ Deployment guide error:",
      error
    );

    return res.status(500).send(
      "Server Error"
    );
  }
};