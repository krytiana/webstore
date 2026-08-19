import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Settings } from "../models/Settings";

const toCleanString = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export async function getProducts(_req: Request, res: Response) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    const settingsDoc = await Settings.findOne({});
    const settings = settingsDoc ? settingsDoc.toObject() : (await Settings.create({})).toObject();

    res.render("index", { products, settings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

export async function getProductDetail(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).send("Product not found");

    const recommended = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .lean();

    const settingsDoc = await Settings.findOne({});
    const settings = settingsDoc ? settingsDoc.toObject() : (await Settings.create({})).toObject();

    res.render("productDetail", { product, recommended, settings });
  } catch (err) {
    console.error(err);
    res.status(404).send("Product not found");
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json(product);
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const body = req.body || {};

    const product = await Product.create({
      category: toCleanString(body.category, 100),
      name: toCleanString(body.name, 200),
      price: Number(body.price),
      images: Array.isArray(body.images) ? body.images.slice(0, 20) : [],
      description: toCleanString(body.description, 10000),
      specs: toCleanString(body.specs, 10000),
      rating: 0,
      reviews: 0,
      options:
        body.options && typeof body.options === "object"
          ? body.options
          : {},
      tags: Array.isArray(body.tags)
        ? body.tags.slice(0, 50).map((tag: unknown) => toCleanString(tag, 50))
        : [],
    });

    if (!product.name || !product.category || !Number.isFinite(product.price) || product.price < 0) {
      await product.deleteOne();
      return res.status(400).json({
        success: false,
        message: "Name, category and a valid non-negative price are required",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Invalid product data",
    });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const body = req.body || {};

    const update: Record<string, unknown> = {};

    if (body.category !== undefined) update.category = toCleanString(body.category, 100);
    if (body.name !== undefined) update.name = toCleanString(body.name, 200);
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ success: false, message: "Invalid price" });
      }
      update.price = price;
    }
    if (body.images !== undefined) update.images = Array.isArray(body.images) ? body.images.slice(0, 20) : [];
    if (body.description !== undefined) update.description = toCleanString(body.description, 10000);
    if (body.specs !== undefined) update.specs = toCleanString(body.specs, 10000);
    if (body.options !== undefined) update.options = body.options;
    if (body.tags !== undefined) {
      update.tags = Array.isArray(body.tags)
        ? body.tags.slice(0, 50).map((tag: unknown) => toCleanString(tag, 50))
        : [];
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated",
      product: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Invalid product data",
    });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Orders intentionally retain their historical product snapshot.
    res.json({ success: true, message: "Product deleted" });
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
}

export async function getProductsJSON(_req: Request, res: Response) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Error fetching products" });
  }
}

export const renderCategoryPage = async (
  req: Request,
  res: Response
) => {
  try {
    const category = decodeURIComponent(String(req.params.category)).trim();
    const products = await Product.find({ category })
      .sort({ createdAt: -1 })
      .lean();

    const settingsDoc = await Settings.findOne({});
    const settings = settingsDoc ? settingsDoc.toObject() : (await Settings.create({})).toObject();

    // Reuse the existing storefront template; the old implementation
    // referenced a missing views/category.ejs file.
    res.render("index", {
      category,
      products,
      settings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
