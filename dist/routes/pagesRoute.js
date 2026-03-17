"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pageController_1 = require("../controllers/pageController");
const router = (0, express_1.Router)();
router.get("/", pageController_1.homePage);
exports.default = router;
