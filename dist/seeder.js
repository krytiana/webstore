"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const ProductModel_1 = __importDefault(require("./models/ProductModel"));
dotenv_1.default.config();
const seedProducts = async () => {
    try {
        await (0, db_1.default)();
        // Delete existing products (optional, for clean testing)
        await ProductModel_1.default.deleteMany({});
        console.log("Existing products removed");
        // Sample products
        const products = [
            new ProductModel_1.default({
                name: "Tech Blog Website",
                slug: "tech-blog",
                category: "Blog",
                price: 49,
                image: "/images/img1.png",
                demoUrl: "/demos/business",
                description: "A modern tech blog template ready to launch.",
                features: ["Responsive", "SEO-friendly", "Fast loading"],
                isActive: true
            }),
            new ProductModel_1.default({
                name: "E-Commerce Store",
                slug: "ecommerce-store",
                category: "E-Commerce",
                price: 99,
                image: "/images/img2.jpg",
                demoUrl: "/demos/business",
                description: "A ready-to-use online store with cart and checkout pages.",
                features: ["Product catalog", "Payment ready", "Mobile friendly"],
                isActive: true
            }),
            new ProductModel_1.default({
                name: "Church Website",
                slug: "church-website",
                category: "Community",
                price: 59,
                image: "/images/img3.png",
                demoUrl: "/demos/business",
                description: "Beautifully designed church website with events and sermons.",
                features: ["Event calendar", "Sermon archive", "Responsive design"],
                isActive: true
            })
        ];
        await ProductModel_1.default.insertMany(products);
        console.log("Sample products inserted successfully");
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
seedProducts();
