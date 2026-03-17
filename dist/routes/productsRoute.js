"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// GET all products
router.get("/", productController_1.getProducts);
// GET single product by slug
router.get("/:slug", productController_1.getProductDetails);
exports.default = router;
