// src/routes/downloadRoute.ts

import express, { Request, Response } from "express";
import fs from "fs";

import DownloadLink from "../models/DownloadLink";
import { createTemplateZip } from "../utils/templateZip";

const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  let zipPath: string | null = null;

  try {
    const { id } = req.params;


    // ---------------------------------------
    // 1. Find download link
    // ---------------------------------------
    const link = await DownloadLink.findById(id).populate("product");

    if (!link) {
      return res.status(404).send("Invalid download link");
    }

    // ---------------------------------------
    // 2. Check expiry
    // ---------------------------------------
    if (link.expiresAt <= new Date()) {
      return res.status(403).send(
        "This download link has expired."
      );
    }

    // ---------------------------------------
    // 3. Check download limit
    // ---------------------------------------
    if (link.successfulDownloads >= link.maxDownloads) {
      return res.status(403).send(
        "Download limit reached."
      );
    }

    // ---------------------------------------
    // 4. Make sure product exists
    // ---------------------------------------
    const product = link.product as any;

    if (!product) {


      return res.status(404).send(
        "Product associated with this download link was not found."
      );
    }

    // ---------------------------------------
    // 5. Validate template
    // ---------------------------------------
    if (!product.templatePath) {

      return res.status(500).send(
        "This product does not have a template configured."
      );
    }

    // ---------------------------------------
    // 6. Create temporary ZIP
    // ---------------------------------------
    zipPath = await createTemplateZip({
      templatePath: product.templatePath,
      slug: product.slug,
    });


    // ---------------------------------------
    // 7. Make sure ZIP exists
    // ---------------------------------------
    if (!fs.existsSync(zipPath)) {
      console.error(
        "❌ Generated ZIP does not exist:",
        zipPath
      );

      return res.status(500).send(
        "Unable to prepare download."
      );
    }

    // ---------------------------------------
    // 8. Send ZIP
    // ---------------------------------------
    res.download(
      zipPath,
      `${product.slug}.zip`,
      async (error) => {

        // -----------------------------------
        // Download failed
        // -----------------------------------
        if (error) {
          console.error(
            "❌ Download transfer error:",
            error
          );


          // Clean up temporary ZIP
          if (zipPath && fs.existsSync(zipPath)) {
            fs.unlink(zipPath, (deleteError) => {
              if (deleteError) {
                console.error(
                  "❌ Failed to delete temporary ZIP:",
                  deleteError
                );
              } else {

              }
            });
          }

          return;
        }

        // -----------------------------------
        // Delete temporary ZIP FIRST
        // -----------------------------------
        if (zipPath && fs.existsSync(zipPath)) {
          try {
            await fs.promises.unlink(zipPath);

          } catch (deleteError) {
            console.error(
              "❌ Failed to delete temporary ZIP:",
              deleteError
            );

            return;
          }
        }


        try {
          const updatedLink =
            await DownloadLink.findOneAndUpdate(
              {
                _id: link._id,
                successfulDownloads: {
                  $lt: link.maxDownloads,
                },
              },
              {
                $inc: {
                  successfulDownloads: 1,
                },
              },
              {
                new: true,
              }
            );

          if (!updatedLink) {
            console.error(
              "❌ Download completed but count could not be updated"
            );

            return;
          }

        } catch (saveError) {
          console.error(
            "❌ Failed to update download count:",
            saveError
          );
        }
      }
    );

  } catch (error) {
    console.error(
      "❌ Download error:",
      error
    );

    // ---------------------------------------
    // Clean up ZIP if something failed
    // ---------------------------------------
    if (zipPath && fs.existsSync(zipPath)) {
      try {
        await fs.promises.unlink(zipPath);


      } catch (cleanupError) {
        console.error(
          "❌ ZIP cleanup error:",
          cleanupError
        );
      }
    }

    return res.status(500).send(
      "Server error while preparing download."
    );
  }
});

export default router;

