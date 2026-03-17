"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Admin dashboard
router.get("/", adminController_1.getAdminDashboard);
// Add product
router.get("/add-product", adminController_1.getAddProduct);
router.post("/add-product", adminController_1.postAddProduct);
// Edit product
router.get("/edit-product/:id", adminController_1.getEditProduct);
router.post("/edit-product/:id", adminController_1.postEditProduct);
// Delete product
router.post("/delete-product/:id", adminController_1.deleteProduct);
exports.default = router;
