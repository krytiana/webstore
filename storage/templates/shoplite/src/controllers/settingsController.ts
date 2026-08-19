import { Request, Response } from "express";
import { Settings } from "../models/Settings";
import { env } from "../config/env";
const allowedFields = ["siteName","currencyCode","currencySymbol","logo","heroImages","primaryColor","secondaryColor","backgroundColor","surfaceColor","surfaceAltColor","headingColor","textColor","mutedTextColor","interactionColor","borderColor","enableStripe","enablePaystack","contactEmail","contactPhone","footerText"] as const;
const color = (value: unknown) => typeof value === "string" && /^(#[0-9a-f]{3,8}|rgba?\([^)]{1,40}\))$/i.test(value.trim());
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0,max) : undefined;
const email = (value: unknown) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? value.trim().toLowerCase() : "";
function pickSettings(body:any) {
  const result:Record<string,unknown>={}; for (const field of allowedFields) if (body?.[field] !== undefined) result[field]=body[field];
  for (const field of ["primaryColor","secondaryColor","backgroundColor","surfaceColor","surfaceAltColor","headingColor","textColor","mutedTextColor","interactionColor","borderColor"]) if (result[field] !== undefined && !color(result[field])) throw new Error(`Invalid ${field}`);
  if (result.siteName!==undefined) result.siteName=text(result.siteName,100);
  if (result.currencyCode!==undefined) { const code=text(result.currencyCode,3)?.toUpperCase(); if(!code || !/^[A-Z]{3}$/.test(code)) throw new Error("Invalid currencyCode"); result.currencyCode=code; }
  if (result.currencySymbol!==undefined) result.currencySymbol=text(result.currencySymbol,8);
  if (result.logo!==undefined) result.logo=text(result.logo,500); if(result.footerText!==undefined) result.footerText=text(result.footerText,500); if(result.contactPhone!==undefined) result.contactPhone=text(result.contactPhone,50); if(result.contactEmail!==undefined) result.contactEmail=email(result.contactEmail);
  if(result.heroImages!==undefined){ if(!Array.isArray(result.heroImages)) throw new Error("heroImages must be an array"); result.heroImages=result.heroImages.filter((v)=>typeof v==="string").slice(0,10).map((v)=>v.slice(0,500)); }
  if(result.enableStripe!==undefined){ result.enableStripe=result.enableStripe===true; if(result.enableStripe && (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)) throw new Error("Stripe is not fully configured on the server"); }
  if(result.enablePaystack!==undefined){ result.enablePaystack=result.enablePaystack===true; if(result.enablePaystack && !process.env.PAYSTACK_SECRET_KEY) throw new Error("Paystack is not configured on the server"); }
  return result;
}
export async function getSettings(_req:Request,res:Response){ try { const settings=await Settings.findOneAndUpdate({},{$setOnInsert:{siteName:env.siteName,currencyCode:env.storeCurrency,currencySymbol:env.storeCurrencySymbol,footerText:`© ${new Date().getFullYear()} ${env.siteName}`}},{upsert:true,returnDocument: "after",setDefaultsOnInsert:true}).lean(); return res.json(settings); } catch(error){ console.error("getSettings error:",error); return res.status(500).json({success:false,message:"Unable to load settings"}); } }
export async function updateSettings(req: Request, res: Response) {
  try {
    const update = pickSettings(req.body);

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: update
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.json({
      success: true,
      settings
    });

  } catch (error: any) {
    console.error("updateSettings error:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Invalid settings"
    });
  }
}