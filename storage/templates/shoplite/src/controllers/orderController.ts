// src/controllers/orderController.ts
import { Request, Response }
from "express";

import Order from "../models/Order";
import User from "../models/User";

// ---------------- GET USER ORDERS ----------------
export const getUserOrders = async (
  req: any,
  res: Response
) => {

  try {

    const orders = await Order.find({
      user: req.user.userId
    })

    .populate("items.product")

    .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

// ---------------- GET SINGLE ORDER TRACKING ----------------
export const getOrderTracking = async (
  req: any,
  res: Response
) => {

  try {

    const { orderId } = req.params;
    if (!/^[a-f\d]{24}$/i.test(orderId)) return res.status(400).json({ success: false, message: "Invalid order ID" });

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId
    });

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,

      orderStatus:
        order.orderStatus,

      trackingHistory:
        order.trackingHistory,

      trackingNumber:
        order.trackingNumber,

      courier:
        order.courier,

      estimatedDelivery:
        order.estimatedDelivery
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
};

// ---------------- ADMIN UPDATE ORDER STATUS ----------------
export const updateOrderStatus = async (
  req: Request,
  res: Response
) => {

  try {

    const { orderId } = req.params;
    if (!/^[a-f\d]{24}$/i.test(String(orderId))) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const {
      status,
      message,
      trackingNumber,
      courier,
      estimatedDelivery
    } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order =
      await Order.findById(orderId);

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.orderStatus = status;

    if (trackingNumber) {
      order.trackingNumber =
        trackingNumber;
    }

    if (courier) {
      order.courier = courier;
    }

    if (estimatedDelivery) {
      order.estimatedDelivery =
        estimatedDelivery;
    }

    order.trackingHistory.push({
      status,
      message,
      updatedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      order
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
};

export const getOrderById = async (
  req: any,
  res: Response
) => {

  try {

    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const currentUser = await User.findById(req.user.userId).select("role").lean();
    if (!currentUser) return res.status(401).json({ success: false, message: "Unauthorized" });
    const query: any = { _id: req.params.id };
    if (currentUser.role !== "admin") query.user = req.user.userId;

    const order = await Order.findOne(query)

      .populate("items.product")

      .populate("user", "email fullname");

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error fetching order"
    });
  }
};

// ---------------- ADMIN GET ALL ORDERS ----------------
export const getAllOrders = async (
  req: Request,
  res: Response
) => {

  try {

    const orders = await Order.find()

      .populate("user", "fullname email")

      .populate("items.product")

      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};
