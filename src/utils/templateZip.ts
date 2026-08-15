// src/utils/templateZip.ts

import fs from "fs";
import path from "path";

import { IProduct } from "../models/ProductModel";
import { getTemplateDirectory } from "./templateStorage";

// archiver v8 is loaded through CommonJS
const archiverModule = require("archiver");

export const createTemplateZip = async (
  product: Pick<IProduct, "templatePath" | "slug">
): Promise<string> => {
  // Validate template directory
  const templateDirectory = getTemplateDirectory(product);

  // Make sure slug exists
  if (!product.slug) {
    throw new Error("Product has no slug configured");
  }

  // Temporary ZIP directory
  const zipDirectory = path.resolve(
    process.cwd(),
    "storage",
    "temp"
  );

  // Create storage/temp if necessary
  if (!fs.existsSync(zipDirectory)) {
    fs.mkdirSync(zipDirectory, {
      recursive: true,
    });
  }

  // Unique ZIP filename
  const zipFileName = `${product.slug}-${Date.now()}.zip`;

  const zipFilePath = path.join(
    zipDirectory,
    zipFileName
  );

  return new Promise<string>((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);

    // archiver v8 exposes ZipArchive
    const ZipArchive = archiverModule.ZipArchive;

    if (!ZipArchive) {
      reject(
        new Error(
          "ZipArchive was not found in the installed archiver package"
        )
      );
      return;
    }

    // Create ZIP archive
    const archive = new ZipArchive({
      zlib: {
        level: 9,
      },
    });

    // ZIP completed
    output.on("close", () => {



      resolve(zipFilePath);
    });

    // Output error
    output.on("error", (error: Error) => {
      console.error(
        "❌ ZIP output error:",
        error
      );

      reject(error);
    });

    // Archive error
    archive.on("error", (error: Error) => {
      console.error(
        "❌ ZIP archive error:",
        error
      );

      reject(error);
    });

    // Connect archive to output
    archive.pipe(output);

    /*
     * Add the complete template.
     *
     * The ZIP will contain:
     *
     * darkymall/
     * ├── public/
     * ├── src/
     * ├── views/
     * ├── package.json
     * ├── package-lock.json
     * ├── tsconfig.json
     * └── ...
     *
     * SECURITY:
     * Real environment files are NOT included.
     *
     * .env
     * .env.local
     * .env.production
     * .env.development
     * etc.
     *
     * .env.example is also excluded by the
     * .env.* pattern, so if you want to distribute
     * .env.example, add it separately later.
     */

    archive.directory(
      templateDirectory,
      product.slug,
      {
        glob: "**/*",
        ignore: [
          "**/.env",
          "**/.env.*",
        ],
      }
    );

    // Finalize ZIP
    archive.finalize().catch((error: Error) => {
      console.error(
        "❌ ZIP finalize error:",
        error
      );

      reject(error);
    });
  });
};
