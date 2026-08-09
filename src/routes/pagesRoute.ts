import { Router, Request, Response } from "express";
import Product from "../models/ProductModel";

const router = Router();

// Home page
router.get("/", (req: Request, res: Response) => {
res.render("home", { title: "Ready-Made Websites" });
});

// About page
router.get("/about", (req: Request, res: Response) => {
res.render("about", { title: "About Us" });
});

// Contact page
router.get("/contact", (req: Request, res: Response) => {
res.render("contact", { title: "Contact" });
});

router.get("/checkout", async (req: Request, res: Response) => {
const { product: slug, plan } = req.query;

if (!slug || !plan) {
return res.redirect("/");
}

const product = await Product.findOne({
slug: slug.toString(),
});

if (!product) {
return res.redirect("/");
}

// Map plan key to label & price
const planMap = {
sourceCode: {
label: "Source Code",
price: product.pricing?.sourceCode ?? 0,
},

assistedSetup: {
  label: "Assisted Setup",
  price: product.pricing?.assistedSetup ?? 0,
},

doneForYou: {
  label: "Done For You",
  price: product.pricing?.doneForYou ?? 0,
},


};

const planKey = plan.toString() as keyof typeof planMap;

const planInfo = planMap[planKey];

if (!planInfo) {
return res.redirect("/");
}

res.render("checkout", {
title: `Checkout - ${product.name}`,
product,
plan: planKey,
planLabel: planInfo.label,
planPrice: planInfo.price,
stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
});
});

export default router;
