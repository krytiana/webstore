// src/utils/templateStorage.ts

import path from "path";
import fs from "fs";
import { IProduct } from "../models/ProductModel";


  const TEMPLATES_ROOT = path.resolve(
  process.cwd(),
  "storage",
  "templates"
  );


  export const getTemplateDirectory = (
  product: Pick<IProduct, "templatePath">
  ): string => {
  if (!product.templatePath) {
  throw new Error("Product has no templatePath configured");
  }

// Prevent paths such as ../../something
const templatePath = path.normalize(product.templatePath);

const templateDirectory = path.resolve(
TEMPLATES_ROOT,
templatePath
);

// Make sure the resolved path stays inside storage/templates
const relativePath = path.relative(
TEMPLATES_ROOT,
templateDirectory
);

if (
relativePath.startsWith("..") ||
path.isAbsolute(relativePath)
) {
throw new Error("Invalid templatePath");
}

// Make sure the template folder actually exists
if (!fs.existsSync(templateDirectory)) {
throw new Error(
`Template directory not found: ${product.templatePath}`
);
}

// Make sure it is a directory
if (!fs.statSync(templateDirectory).isDirectory()) {
throw new Error(
`Template path is not a directory: ${product.templatePath}`
);
}

return templateDirectory;
};


  export const getTemplatesRoot = (): string => {
  return TEMPLATES_ROOT;
  };
