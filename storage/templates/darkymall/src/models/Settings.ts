// src/models/Settings.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
siteName: string;
logo: string;
heroImages: string[];

// Brand
primaryColor: string;
secondaryColor: string;

// Backgrounds
backgroundColor: string;
surfaceColor: string;
surfaceAltColor: string;

// Text
headingColor: string;
textColor: string;
mutedTextColor: string;
interactionColor: string;

// Border
borderColor: string;

// Payment Methods
enableStripe: boolean;
enablePaystack: boolean;

// Contact
contactEmail: string;
contactPhone: string;

footerText: string;
}

const settingsSchema = new Schema<ISettings>({

siteName: {
type: String,
default: "My Store"
},

logo: {
type: String,
default: "/images/logo.png"
},

heroImages: {
type: [String],
default: []
},

// =====================================================
// Brand
// =====================================================

primaryColor: {
type: String,
default: "#ea580c"
},

secondaryColor: {
type: String,
default: "#f59e0b"
},

// =====================================================
// Backgrounds
// =====================================================

backgroundColor: {
type: String,
default: "#fff7ed"
},

surfaceColor: {
type: String,
default: "#ffffff"
},

surfaceAltColor: {
type: String,
default: "#ffedd5"
},

// =====================================================
// Text
// =====================================================

headingColor: {
type: String,
default: "#431407"
},

textColor: {
type: String,
default: "#57534e"
},

mutedTextColor: {
type: String,
default: "#78716c"
},

interactionColor: {
type: String,
default: "#ffffff"
},

// =====================================================
// Border
// =====================================================

borderColor: {
type: String,
default: "#fed7aa"
},

// =====================================================
// Payment Methods
// =====================================================

enableStripe: {
type: Boolean,
default: false
},

enablePaystack: {
type: Boolean,
default: true
},

// =====================================================
// Contact
// =====================================================

contactEmail: {
type: String,
default: ""
},

contactPhone: {
type: String,
default: ""
},

footerText: {
type: String,
default: "© 2026 My Store"
}

});

export const Settings = mongoose.model<ISettings>(
"Settings",
settingsSchema
);
