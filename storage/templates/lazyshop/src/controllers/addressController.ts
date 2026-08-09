// src/controllers/addressController.ts

import { Response } from "express";

import Address from "../models/address";

import { RequestWithUser } from "../middlewares/authMiddleware";


// ➕ Add Address
export const addAddress = async (
  req: RequestWithUser,
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    const address = await Address.create({
      ...req.body,
      userId
    });

    res.json({
      success: true,
      message: "Address added",
      address
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error adding address"
    });
  }
};


// 📄 Get All Addresses
export const getAddresses = async (
  req: RequestWithUser,
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    const addresses = await Address.find({
      userId
    }).sort({
      createdAt: -1
    });

    res.json(addresses);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error fetching addresses"
    });
  }
};


// ✏️ Update Address
export const updateAddress = async (
  req: RequestWithUser,
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const updated = await Address.findOneAndUpdate(
      {
        _id: id,
        userId
      },
      {
        $set: req.body
      },
      {
        returnDocument: "after"
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Updated",
      address: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error updating"
    });
  }
};


// ❌ Delete Address
export const deleteAddress = async (
  req: RequestWithUser,
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const deleted = await Address.findOneAndDelete({
      _id: id,
      userId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error deleting"
    });
  }
};


// ⭐ Set Default Address
export const setDefaultAddress = async (
  req: RequestWithUser,
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    // remove existing default
    await Address.updateMany(
      { userId },
      {
        $set: {
          isDefault: false
        }
      }
    );

    // set new default
    const updated = await Address.findOneAndUpdate(
      {
        _id: id,
        userId
      },
      {
        $set: {
          isDefault: true
        }
      },
      {
        returnDocument: "after"
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Default set",
      address: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error setting default"
    });
  }
};