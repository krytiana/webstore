import { Response } from "express";
import Address from "../models/address";
import { RequestWithUser } from "../middlewares/authMiddleware";

const addressFields = [
  "fullName",
  "phone",
  "addressLine",
  "city",
  "region",
  "country",
  "latitude",
  "longitude",
] as const;

function pickAddress(body: any) {
  const result: Record<string, unknown> = {};

  for (const field of addressFields) {
    if (body?.[field] !== undefined) {
      result[field] = body[field];
    }
  }

  return result;
}

export const addAddress = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const data = pickAddress(req.body);

    for (const field of ["fullName", "phone", "addressLine", "city", "region", "country"]) {
      if (typeof data[field] !== "string" || !(data[field] as string).trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    const address = await Address.create({
      ...data,
      userId,
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      message: "Address added",
      address,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Invalid address",
    });
  }
};

export const getAddresses = async (req: RequestWithUser, res: Response) => {
  try {
    const addresses = await Address.find({
      userId: req.user?.userId,
    }).sort({ createdAt: -1 });

    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching addresses",
    });
  }
};

export const updateAddress = async (req: RequestWithUser, res: Response) => {
  try {
    const updated = await Address.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user?.userId,
      },
      {
        $set: pickAddress(req.body),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Updated",
      address: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Invalid address",
    });
  }
};

export const deleteAddress = async (req: RequestWithUser, res: Response) => {
  try {
    const deleted = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Invalid address",
    });
  }
};

export const setDefaultAddress = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    const address = await Address.findOne({
      _id: req.params.id,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Keep the operation scoped to the authenticated user.
    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: "Default set",
      address,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Unable to set default address",
    });
  }
};
