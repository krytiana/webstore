// controllers/settingsController.ts
import { Request, Response } from "express";
import { Settings } from "../models/Settings";

// GET SETTINGS
export async function getSettings(req: Request, res: Response) {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  res.json(settings);
}

// UPDATE SETTINGS
export async function updateSettings(req: Request, res: Response) {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings(req.body);
  } else {
    Object.assign(settings, req.body);
  }

  await settings.save();
  res.json({ success: true, settings });
}