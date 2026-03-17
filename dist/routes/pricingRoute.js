"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricingController_1 = require("../controllers/pricingController");
const router = (0, express_1.Router)();
// GET /pricing
router.get("/", pricingController_1.getPricing);
exports.default = router;
