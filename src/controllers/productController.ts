
//src/controllers/productController.ts
import { Request, Response } from "express";
import Product from "../models/ProductModel";

// Get all active products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;

    let query: any = {};

    // Search by name
    if (search) {
      query.name = { $regex: search as string, $options: "i" };
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Get categories for dropdown
    const categories = await Product.distinct("category");

    res.render("products", {
      title: "All Websites",
      products,
      categories,
      selectedCategory: category || "all",
      searchQuery: search || "",
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// Get single product details by slug
export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true });

    if (!product) {
      return res.status(404).render("404", { title: "Product Not Found" });
    }

    res.render("productDetails", { title: product.name, product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
