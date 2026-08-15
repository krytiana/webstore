import { Request, Response } from "express";
import ServiceOrder from "../models/ServiceOrder";
import { sendDoneForYouNotificationEmail } from "../services/emailService";

export const notifyAdminDoneForYou = async (
  req: any,
  res: Response
) => {

  try {

    const userId =
      req.user?.userId;

    const { orderId } =
      req.body;

    // --------------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------------

    if (!userId) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    }


    // --------------------------------------------------------
    // ORDER ID CHECK
    // --------------------------------------------------------

    if (!orderId) {

      return res.status(400).json({
        success: false,
        message: "Missing order ID"
      });

    }


    // --------------------------------------------------------
    // FIND ORDER
    //
    // IMPORTANT:
    // Only allow the owner of the order to notify admin.
    // --------------------------------------------------------

    const order =
      await ServiceOrder
        .findOne({
          _id: orderId,
          user: userId
        })
        .populate("product")
        .populate("user");
        


    if (!order) {

      console.error(
        "❌ Service order not found:",
        orderId
      );

      return res.status(404).json({
        success: false,
        message: "Service order not found"
      });

    }


    // --------------------------------------------------------
    // ONLY DONE FOR YOU
    // --------------------------------------------------------

    if (order.plan !== "doneForYou") {

      return res.status(400).json({
        success: false,
        message:
          "Admin notification is only available for Done For You orders."
      });

    }


    // --------------------------------------------------------
    // ONLY PENDING ORDERS
    // --------------------------------------------------------

    if (order.status !== "pending") {

      return res.status(400).json({
        success: false,
        message:
          "This order cannot be notified at its current status."
      });

    }


    // --------------------------------------------------------
    // SEND ADMIN EMAIL
    // --------------------------------------------------------

    await sendDoneForYouNotificationEmail(
      order
    );



    return res.json({
      success: true,
      message: "Admin has been notified."
    });


  } catch (error) {

    console.error(
      "❌ Done For You notification error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to notify admin."
    });

  }

};