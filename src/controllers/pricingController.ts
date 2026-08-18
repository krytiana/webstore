//src/controllers/pricingController.ts

import { Request, Response } from "express";

export const getPricing = (req: Request, res: Response) => {
  const packages = [
    {
      name: "Basic",
      priceRange: "$30.99 – $99.99",
      subtitle: "For Developers & DIY Users",
      bestFor: "Developers or users comfortable with basic setup",
      features: [
        "Full Source Code download",
        "Setup Guide (setup.md)",
        "Project Documentation (README.md)",
        "Lifetime Access",
        "Ai Deployment support"

      ],
      notIncluded: [
        "No One Click To Deploy Attached",
        "No Deployment Wizard",
        "No Human Assistant",
        "No Priority Respond",
        "No Handling Everything For Me"
      ]
    },
    {
      name: "Assisted",
      priceRange: "$100 – $149.99",
      subtitle: "For Beginners",
      bestFor: "Non-technical users who want guidance",
      features: [
        "Everything in Basic",
        "Step-by-step assistance",
        "Email support (setup help)",
        "Priority response",
        "One Click To Deploy Attached",
        "Deployment Wizard",
        "Human Assistant",
        "Priority Respond",
      ],
      notIncluded: [
        "Do it Yourself"
      ],
      popular: true
    },
    {
      name: "Done-for-You",
      priceRange: "$150.99+",
      subtitle: "Sit Back & Relax",
      bestFor: "Business owners who want everything handled",
      features: [
        "Everything in Assisted",
        "Full installation & deployment",
        "Environment setup (Render, database, APIs)",
        "Testing before delivery",
        "Dedicated support"
      ]
    }
  ];

  res.render("pricing", {
    title: "Pricing",
    packages
  });
};