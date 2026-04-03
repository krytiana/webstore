//src/controllers/adminController.ts
import { Request, Response } from "express";
import Product from "../models/ProductModel";

// Admin dashboard
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin/dashboard", { title: "Admin Dashboard", products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading dashboard");
  }
};

// Add product form
export const getAddProduct = (req: Request, res: Response) => {
  res.render("admin/addProduct", { title: "Add Product" });
};

// Handle add product
export const postAddProduct = async (req: Request, res: Response) => {
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
    } = req.body;

    // Handle category if "Other" is selected
    const finalCategory =
      category === "Other" && req.body.customCategory
        ? req.body.customCategory
        : category;

    // Construct media URLs
    const image = `/${imageFolder}/${imageName}`;
    const demoUrl = demoName ? `/demos/Fashionfamme/${demoName}` : "";

    // Create product
    await Product.create({
      name,
      slug, // optional: will auto-generate if empty in schema
      category: finalCategory,
      description,
      features: {
        frontend: Array.isArray(frontendFeatures)
          ? frontendFeatures
          : frontendFeatures
          ? [frontendFeatures]
          : [],
        backend: Array.isArray(backendFeatures)
          ? backendFeatures
          : backendFeatures
          ? [backendFeatures]
          : [],
        techStack,
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
      isActive: true,
    });

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding product");
  }
};

// Edit product form
export const getEditProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("admin/editProduct", { title: "Edit Product", product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading product");
  }
};

// Handle edit product
export const postEditProduct = async (req: Request, res: Response) => {
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
      demoFolder,
    } = req.body;

    const finalCategory =
      category === "Other" && req.body.customCategory
        ? req.body.customCategory
        : category;

    const image = `/images/${imageFolder}/${imageName}`;
    const demoUrl = demoFolder ? `/demos/${demoFolder}/index.html` : "";

    await Product.findByIdAndUpdate(req.params.id, {
      name,
      slug, // optional
      category: finalCategory,
      description,
      features: {
        frontend: Array.isArray(frontendFeatures)
          ? frontendFeatures
          : frontendFeatures
          ? [frontendFeatures]
          : [],
        backend: Array.isArray(backendFeatures)
          ? backendFeatures
          : backendFeatures
          ? [backendFeatures]
          : [],
        techStack,
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
    });

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error editing product");
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting product");
  }
};
