import { Request, Response } from "express";
import ServiceOrder from "../models/ServiceOrder";


// ============================================================
// GET MY SERVICE ORDERS
// ============================================================

export const getMyServiceOrders = async (
  req: any,
  res: Response
) => {

  try {

    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    const userId = req.user?.userId;

    if (!userId) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    }


    // --------------------------------------------------------
    // FETCH SERVICE ORDERS
    // --------------------------------------------------------

    const serviceOrders =
      await ServiceOrder.find({
        user: userId,
      })
        .populate(
          "product",
          "name slug"
        )
        .sort({
          createdAt: -1,
        });


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.json({

      success: true,

      serviceOrders,

    });

  } catch (error) {

    console.error(
      "❌ Get service orders error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch service orders",

    });

  }

};