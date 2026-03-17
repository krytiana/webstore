"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPricing = void 0;
// Pricing page
const getPricing = (req, res) => {
    // Sample packages
    const packages = [
        {
            name: "Basic",
            price: 49,
            features: [
                "Single-page website",
                "Responsive design",
                "Basic SEO"
            ]
        },
        {
            name: "Standard",
            price: 79,
            features: [
                "Up to 5 pages",
                "Responsive design",
                "SEO optimized",
                "Contact form"
            ]
        },
        {
            name: "Premium",
            price: 129,
            features: [
                "Unlimited pages",
                "Responsive + SEO + Analytics",
                "Contact form + Blog",
                "Custom branding"
            ]
        }
    ];
    res.render("pricing", { title: "Pricing", packages });
};
exports.getPricing = getPricing;
