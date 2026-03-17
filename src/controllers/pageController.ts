import { Request, Response } from "express";

export const homePage = (req: Request, res: Response): void => {
  res.render("home", { title: "Ready-Made Websites" });
};
