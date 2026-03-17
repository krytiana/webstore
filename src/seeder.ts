import dotenv from "dotenv";
import connectDB from "./config/db";
import Product, { IProduct } from "./models/ProductModel";

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    // Delete existing products (optional, for clean testing)
    await Product.deleteMany({});
    console.log("Existing products removed");

    // Sample products
    const products: IProduct[] = [
      new Product({
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
      new Product({
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
      
      new Product({
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

    await Product.insertMany(products);
    console.log("Sample products inserted successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
