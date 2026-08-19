import crypto from "crypto";
import { Cart } from "../models/cart";
import Address from "../models/address";
import Order from "../models/Order";
export function generateOrderNumber() { return "ORD-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase(); }
export async function getCheckoutSnapshot(userId: string) {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) throw new Error("Cart is empty");
  const address = await Address.findOne({ userId, isDefault: true }).lean();
  if (!address) throw new Error("No default address found");
  const items = cart.items.map((item: any) => {
    const product = item.productId;
    if (!product?._id || !Number.isFinite(product.price) || product.price < 0) throw new Error("Cart contains an invalid product");
    return { product: product._id, name: String(product.name).slice(0, 200), price: Number(product.price), image: typeof product.images?.[0] === "string" ? product.images[0] : "", quantity: Number(item.quantity), selectedOptions: item.selectedOptions || {} };
  });
  const totalAmount = Number(items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) throw new Error("Invalid cart amount");
  return { items, totalAmount, shippingAddress: { fullName: address.fullName, phone: address.phone, addressLine: address.addressLine, city: address.city, region: address.region, country: address.country } };
}
export async function createPendingOrder(userId: string, provider: "stripe" | "paystack", snapshot: Awaited<ReturnType<typeof getCheckoutSnapshot>>, paymentReference?: string) {
  return Order.create({ user: userId, items: snapshot.items, shippingAddress: snapshot.shippingAddress, totalAmount: snapshot.totalAmount, paymentProvider: provider, ...(provider === "paystack" ? { paystackReference: paymentReference } : {}), paymentStatus: "pending", orderStatus: "pending", orderNumber: generateOrderNumber(), trackingHistory: [] });
}
export async function clearUserCart(userId: string) { await Cart.updateOne({ userId }, { $set: { items: [] } }); }
