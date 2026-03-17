"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const pagesRoute_1 = __importDefault(require("./routes/pagesRoute"));
const productsRoute_1 = __importDefault(require("./routes/productsRoute"));
const pricingRoute_1 = __importDefault(require("./routes/pricingRoute"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const ProductModel_1 = __importDefault(require("./models/ProductModel"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");
// Routes
app.use("/", pagesRoute_1.default);
app.use("/products", productsRoute_1.default);
app.use("/pricing", pricingRoute_1.default);
app.use("/admin", adminRoute_1.default);
(0, db_1.default)();
const testProduct = async () => {
    const count = await ProductModel_1.default.countDocuments();
    console.log("Product count:", count);
};
testProduct();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
