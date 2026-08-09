import Product from "../models/ProductModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { getTemplateDirectory } from "./templateStorage";

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("MongoDB connected");

    const product = await Product.findOne({
      slug: "darkymall",
    });

    if (!product) {
      throw new Error("DarkyMall product not found");
    }

    console.log("Product:", product.name);
    console.log("templatePath:", product.templatePath);

    const templateDirectory = getTemplateDirectory(product);

    console.log("✅ Template directory found:");
    console.log(templateDirectory);

    process.exit(0);

  } catch (error) {
    console.error("❌ Template storage test failed:");
    console.error(error);

    process.exit(1);
  }
};

test();