// src/controllers/adminController.ts

import { Request, Response } from "express";
import Product from "../models/ProductModel";

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const getAdminDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      products,
    });
  } catch (error) {
    console.error("❌ Error loading dashboard:", error);
    res.status(500).send("Error loading dashboard");
  }
};


// ============================================================
// ADD PRODUCT FORM
// ============================================================

export const getAddProduct = (
  req: Request,
  res: Response
) => {
  res.render("admin/addProduct", {
    title: "Add Product",
  });
};


// ============================================================
// ADD PRODUCT
// ============================================================

export const postAddProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      slug,
      category,
      description,

      frontendFeatures,
      backendFeatures,
      techStack,

      pricingCardType,
      priceSource,
      priceAssisted,
      priceDone,

      imageFolder,
      imageName,

      demoName,

      templatePath,
    } = req.body;


    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    const finalCategory =
      category === "Other" && req.body.customCategory
        ? req.body.customCategory
        : category;


    // --------------------------------------------------------
    // FEATURES
    // --------------------------------------------------------

    const frontend = Array.isArray(frontendFeatures)
      ? frontendFeatures
      : frontendFeatures
      ? frontendFeatures
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];


    const backend = Array.isArray(backendFeatures)
      ? backendFeatures
      : backendFeatures
      ? backendFeatures
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];



    const image = imageName
      ? `/images/${imageName}`
      : "";


   
    const demoUrl = demoName
      ? `/demos/ecommerce/${demoName}`
      : "";


    // --------------------------------------------------------
    // CREATE PRODUCT
    // --------------------------------------------------------

    await Product.create({
      name,
      slug,

      category: finalCategory,

      description,

      features: {
        frontend,
        backend,
        techStack: techStack || "",
      },

      pricing: {
        cardType: pricingCardType,
        sourceCode: Number(priceSource),
        assistedSetup: Number(priceAssisted),
        doneForYou: Number(priceDone),
      },

      media: {
        image,
        demoUrl,
      },

      templatePath,

      isActive: true,
    });


    res.redirect("/admin");

  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).send("Error adding product");
  }
};


// ============================================================
// EDIT PRODUCT FORM
// ============================================================

export const getEditProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("admin/editProduct", {
      title: "Edit Product",
      product,
    });

  } catch (error) {
    console.error("❌ Error loading product:", error);
    res.status(500).send("Error loading product");
  }
};


// ============================================================
// EDIT PRODUCT
// ============================================================

export const postEditProduct = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      name,
      slug,
      category,
      description,

      frontendFeatures,
      backendFeatures,
      techStack,

      pricingCardType,
      priceSource,
      priceAssisted,
      priceDone,

      imageName,

      demoName,

      templatePath,
    } = req.body;


    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    const finalCategory =
      category === "Other" && req.body.customCategory
        ? req.body.customCategory
        : category;


    // --------------------------------------------------------
    // FEATURES
    // --------------------------------------------------------

    const frontend = Array.isArray(frontendFeatures)
      ? frontendFeatures
      : frontendFeatures
      ? frontendFeatures
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];


    const backend = Array.isArray(backendFeatures)
      ? backendFeatures
      : backendFeatures
      ? backendFeatures
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];


    // --------------------------------------------------------
    // GET EXISTING PRODUCT
    // --------------------------------------------------------

    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }


    // --------------------------------------------------------
    // IMAGE
    //
    // If a new image name is entered, update it.
    // Otherwise preserve the existing image.
    // --------------------------------------------------------

    const image = imageName
      ? `/images/${imageName}`
      : existingProduct.media?.image || "";


    // --------------------------------------------------------
    // DEMO
    //
    // If a new demo filename is entered, update it.
    // Otherwise preserve the existing demo URL.
    // --------------------------------------------------------

    const demoUrl = demoName
      ? `/demos/ecommerce/${demoName}`
      : existingProduct.media?.demoUrl || "";


    // --------------------------------------------------------
    // UPDATE PRODUCT
    // --------------------------------------------------------

    await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug,

        category: finalCategory,

        description,

        features: {
          frontend,
          backend,
          techStack: techStack || "",
        },

        pricing: {
          cardType: pricingCardType,
          sourceCode: Number(priceSource),
          assistedSetup: Number(priceAssisted),
          doneForYou: Number(priceDone),
        },

        media: {
          image,
          demoUrl,
        },

        templatePath,
      },
      {
        new: true,
      }
    );


    res.redirect("/admin");

  } catch (error) {
    console.error("❌ Error editing product:", error);
    res.status(500).send("Error editing product");
  }
};


// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {

    await Product.findByIdAndDelete(req.params.id);

    res.redirect("/admin");

  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
};

// ==========================================
// CAMPAIGN PAGE
// ==========================================

export const getCampaignPage = async (
    req: Request,
    res: Response
) => {

    try {

        return res.render("admin/campaign", {
            title: "Create Campaign"
        });

    } catch (error) {

        console.error(
            "❌ Error loading campaign page:",
            error
        );

        return res.status(500).send(
            "Unable to load campaign page."
        );

    }

};