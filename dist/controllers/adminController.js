"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.postEditProduct = exports.getEditProduct = exports.postAddProduct = exports.getAddProduct = exports.getAdminDashboard = void 0;
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
// Admin dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const products = await ProductModel_1.default.find().sort({ createdAt: -1 });
        res.render("admin/dashboard", { title: "Admin Dashboard", products });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error loading dashboard");
    }
};
exports.getAdminDashboard = getAdminDashboard;
// Add product form
const getAddProduct = (req, res) => {
    res.render("admin/addProduct", { title: "Add Product" });
};
exports.getAddProduct = getAddProduct;
// Handle add product
const postAddProduct = async (req, res) => {
    try {
        const { name, slug, category, description, frontendFeatures, backendFeatures, techStack, pricingCardType, priceSource, priceAssisted, priceDone, imageFolder, imageName, demoFolder, } = req.body;
        // Handle category if "Other" is selected
        const finalCategory = category === "Other" && req.body.customCategory
            ? req.body.customCategory
            : category;
        // Construct media URLs
        const image = `/images/${imageFolder}/${imageName}`;
        const demoUrl = demoFolder ? `/demos/${demoFolder}/index.html` : "";
        // Create product
        await ProductModel_1.default.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error adding product");
    }
};
exports.postAddProduct = postAddProduct;
// Edit product form
const getEditProduct = async (req, res) => {
    try {
        const product = await ProductModel_1.default.findById(req.params.id);
        if (!product)
            return res.status(404).send("Product not found");
        res.render("admin/editProduct", { title: "Edit Product", product });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error loading product");
    }
};
exports.getEditProduct = getEditProduct;
// Handle edit product
const postEditProduct = async (req, res) => {
    try {
        const { name, slug, category, description, frontendFeatures, backendFeatures, techStack, pricingCardType, priceSource, priceAssisted, priceDone, imageFolder, imageName, demoFolder, } = req.body;
        const finalCategory = category === "Other" && req.body.customCategory
            ? req.body.customCategory
            : category;
        const image = `/images/${imageFolder}/${imageName}`;
        const demoUrl = demoFolder ? `/demos/${demoFolder}/index.html` : "";
        await ProductModel_1.default.findByIdAndUpdate(req.params.id, {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error editing product");
    }
};
exports.postEditProduct = postEditProduct;
// Delete product
const deleteProduct = async (req, res) => {
    try {
        await ProductModel_1.default.findByIdAndDelete(req.params.id);
        res.redirect("/admin");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error deleting product");
    }
};
exports.deleteProduct = deleteProduct;
