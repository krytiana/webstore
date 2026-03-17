"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductDetails = exports.getProducts = void 0;
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
// Get all active products
const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        // Search by name
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        // Filter by category
        if (category && category !== "all") {
            query.category = category;
        }
        const products = await ProductModel_1.default.find(query).sort({ createdAt: -1 });
        // Get categories for dropdown
        const categories = await ProductModel_1.default.distinct("category");
        res.render("products", {
            title: "All Websites",
            products,
            categories,
            selectedCategory: category || "all",
            searchQuery: search || "",
        });
    }
    catch (error) {
        res.status(500).send("Server Error");
    }
};
exports.getProducts = getProducts;
// Get single product details by slug
const getProductDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await ProductModel_1.default.findOne({ slug, isActive: true });
        if (!product) {
            return res.status(404).render("404", { title: "Product Not Found" });
        }
        res.render("productDetails", { title: product.name, product });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
exports.getProductDetails = getProductDetails;
