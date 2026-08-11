// src/utils/envRequirements.ts
export type EnvRequirementType =
  | "automatic"
  | "mongodb"
  | "service"
  | "admin";

export interface EnvRequirement {
  name: string;
  type: EnvRequirementType;
}

const AUTOMATIC_VARIABLES = new Set([
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
]);

const MONGODB_VARIABLES = new Set([
  "MONGO_URI",
]);

const ADMIN_PREFIX = "ADMIN_";

const SERVICE_PREFIXES = [
  "BREVO_",
  "STRIPE_",
  "PAYSTACK_",
  "IMAGEKIT_",
];

export function classifyEnvVariable(
  name: string
): EnvRequirementType {
  if (AUTOMATIC_VARIABLES.has(name)) {
    return "automatic";
  }

  if (MONGODB_VARIABLES.has(name)) {
    return "mongodb";
  }

  if (name.startsWith(ADMIN_PREFIX)) {
    return "admin";
  }

  if (
    SERVICE_PREFIXES.some((prefix) =>
      name.startsWith(prefix)
    )
  ) {
    return "service";
  }

  return "service";
}

export function classifyEnvVariables(
  variables: string[]
): EnvRequirement[] {
  return variables.map((name) => ({
    name,
    type: classifyEnvVariable(name),
  }));
}