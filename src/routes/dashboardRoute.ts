// src/routes/dashboardRoute.ts
import { Router, Response } from "express";
import { authenticateToken, RequestWithUser } from "../middlewares/authMiddleware";
import DownloadLink from "../models/DownloadLink";
import ServiceOrder from "../models/ServiceOrder";

const router = Router();

// Protected dashboard route
router.get(
  "/",
  authenticateToken,
  async (req: RequestWithUser, res: Response) => {

    try {

      const userId = req.user!.userId;


      // ------------------------------------------------------
      // FETCH DOWNLOADS
      // ------------------------------------------------------

      const downloads =
        await DownloadLink.find({
          user: userId
        })
        .populate(
          "product",
          "name media slug"
        );


      // ------------------------------------------------------
      // FETCH SERVICE ORDERS
      // ------------------------------------------------------

      const serviceOrders =
        await ServiceOrder.find({
          user: userId
        })
        .populate(
          "product",
          "name media slug"
        )
        .sort({
          createdAt: -1
        });


      // ------------------------------------------------------
      // RENDER DASHBOARD
      // ------------------------------------------------------

      res.render("dashboard", {

        title: "Dashboard",

        user: req.user,

        downloads,

        serviceOrders

      });


    } catch (err) {

      console.error(
        "Dashboard error:",
        err
      );

      res.status(500).send(
        "Server error"
      );

    }

  }
);

export default router;