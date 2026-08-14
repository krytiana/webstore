import { Router, Response } from "express";
import { authenticateToken, RequestWithUser } from "../middlewares/authMiddleware";
import ServiceOrder from "../models/ServiceOrder";
import {
  notifyAdminDoneForYou
} from "../controllers/serviceOrderController";

const router = Router();

// ============================================================
// NOTIFY ADMIN — DONE FOR YOU
// ============================================================

router.post(
  "/notify-admin",
  authenticateToken,
  notifyAdminDoneForYou
);

// ============================================================
// VIEW SERVICE ORDER
// ============================================================

router.get(
  "/:id",
  authenticateToken,
  async (req: RequestWithUser, res: Response) => {

    try {

      const userId = req.user!.userId;
      const serviceOrderId = req.params.id;


      // ------------------------------------------------------
      // FIND SERVICE ORDER
      // ------------------------------------------------------

      const serviceOrder =
        await ServiceOrder.findOne({
          _id: serviceOrderId,
          user: userId,
        })
        .populate(
          "product",
          "name media slug"
        );


      // ------------------------------------------------------
      // NOT FOUND / NOT OWNER
      // ------------------------------------------------------

      if (!serviceOrder) {

        return res.status(404).send(
          "Service order not found"
        );

      }


      // ------------------------------------------------------
      // RENDER SERVICE ORDER
      // ------------------------------------------------------

      return res.render(
        "service-order",
        {
          title: "Service Order",
          user: req.user,
          serviceOrder,
        }
      );


    } catch (error) {

      console.error(
        "Service order error:",
        error
      );

      return res.status(500).send(
        "Server error"
      );

    }

  }
);


export default router;