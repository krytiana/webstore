import dotenv from "dotenv";

dotenv.config();

const bool = (value: string | undefined, fallback = false) =>
  value === undefined ? fallback : value.toLowerCase() === "true";

const required = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 5000),

  clientUrl:
    process.env.CLIENT_URL?.replace(/\/+$/, "") ||
    "http://localhost:5000",

  siteName:
    process.env.SITE_NAME?.trim() || "My Store",

  // Store currency is the default currency used when
  // the Settings document has not been created yet.
  storeCurrency:
    (process.env.STORE_CURRENCY || "GHS").toUpperCase(),

  storeCurrencySymbol:
    process.env.STORE_CURRENCY_SYMBOL || "GH₵",

  // These are no longer the source of truth for the store.
  // They are only optional provider-specific defaults/fallbacks.
  stripeCurrency:
    (process.env.STRIPE_CURRENCY || "").toLowerCase(),

  paystackCurrency:
    (process.env.PAYSTACK_CURRENCY || "").toUpperCase(),

  enableStripe: bool(
    process.env.ENABLE_STRIPE,
    Boolean(process.env.STRIPE_SECRET_KEY)
  ),

  enablePaystack: bool(
    process.env.ENABLE_PAYSTACK,
    Boolean(process.env.PAYSTACK_SECRET_KEY)
  ),
};

export const validateEnvironment = () => {
  required("MONGO_URI");

  const jwt = required("JWT_SECRET");
  const refresh = required("REFRESH_TOKEN_SECRET");

  required("CLIENT_URL");

  if (
    !Number.isInteger(env.port) ||
    env.port < 1 ||
    env.port > 65535
  ) {
    throw new Error("PORT must be a valid TCP port");
  }

  if (!/^[A-Z]{3}$/.test(env.storeCurrency)) {
    throw new Error(
      "STORE_CURRENCY must be a 3-letter currency code"
    );
  }

  if (env.nodeEnv === "production") {
    if (jwt.length < 32 || refresh.length < 32) {
      throw new Error(
        "JWT_SECRET and REFRESH_TOKEN_SECRET must each be at least 32 characters in production"
      );
    }

    if (!env.clientUrl.startsWith("https://")) {
      throw new Error(
        "CLIENT_URL must use HTTPS in production"
      );
    }
  }

  if (env.enableStripe) {
    required("STRIPE_SECRET_KEY");
    required("STRIPE_WEBHOOK_SECRET");
  }

  if (env.enablePaystack) {
    required("PAYSTACK_SECRET_KEY");
  }

  if (
    process.env.BREVO_API_KEY ||
    process.env.EMAIL_SENDER
  ) {
    required("BREVO_API_KEY");
    required("EMAIL_SENDER");
  }

  if (
    process.env.IMAGEKIT_PUBLIC_KEY ||
    process.env.IMAGEKIT_PRIVATE_KEY ||
    process.env.IMAGEKIT_URL_ENDPOINT
  ) {
    required("IMAGEKIT_PUBLIC_KEY");
    required("IMAGEKIT_PRIVATE_KEY");
    required("IMAGEKIT_URL_ENDPOINT");
  }
};