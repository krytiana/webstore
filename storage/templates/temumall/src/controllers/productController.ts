//src/controllers/productController.ts

import { Request, Response } from "express";
import { Product } from "../models/Product"
import { Settings } from "../models/Settings";
import User from "../models/User";

// GET ALL PRODUCTS
export async function getProducts(req: Request, res: Response) {
  try {
    const products = await Product.find({});
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    res.render("index", { products, settings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

// GET PRODUCT DETAIL
export async function getProductDetail(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).send("Product not found");

    // Recommended products: same category, limit 4
    const recommended = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    //render setting values in product detail page
     let settings = await Settings.findOne({});

    res.render("productDetail", { product, recommended, settings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

// OPTIONAL: GET SINGLE PRODUCT JSON (API)
export async function getProduct(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

// CREATE PRODUCT
export async function createProduct(req: Request, res: Response) {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ message: "Product created", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product" });
  }
}

// UPDATE PRODUCT
export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json({ message: "Product updated", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
}

// DELETE PRODUCT
export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
}

// GET ALL PRODUCTS (JSON for admin)
export async function getProductsJSON(req: Request, res: Response) {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
}

export const renderCategoryPage = async (
  req: Request,
  res: Response
) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      category
    });

    let settings = await Settings.findOne({});
    res.render("category", {
      category,
      products,
      settings
    });

  } catch (err) {
    console.error(err);

    res.status(500).send("Server Error");
  }
};