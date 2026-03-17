"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homePage = void 0;
const homePage = (req, res) => {
    res.render("home", { title: "Ready-Made Websites" });
};
exports.homePage = homePage;
