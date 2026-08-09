
// src/routes/downloadRoute.ts

import express, { Request, Response } from "express";
import fs from "fs";

import DownloadLink from "../models/DownloadLink";
import { createTemplateZip } from "../utils/templateZip";

const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  let zipPath: string | null = null;
  let downloadReserved = false;
  let reservedLinkId: string | null = null;

  try {
    const { id } = req.params;

    console.log("🔎 Download request:", id);

    // ---------------------------------------
    // 1. Find download link
    // ---------------------------------------
    const link = await DownloadLink.findById(id).populate("product");

    if (!link) {
      console.log("❌ Download link not found");
      return res.status(404).send("Invalid download link");
    }

    // ---------------------------------------
    // 2. Check expiry
    // ---------------------------------------
    if (link.expiresAt <= new Date()) {
      console.log("❌ Download link expired");

      return res.status(403).send(
        "This download link has expired."
      );
    }

    // ---------------------------------------
    // 3. Atomically reserve one download
    // ---------------------------------------
    const reservedLink = await DownloadLink.findOneAndUpdate(
      {
        _id: link._id,
        expiresAt: { $gt: new Date() },
        $expr: {
          $lt: [
            "$successfulDownloads",
            "$maxDownloads",
          ],
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

    if (!reservedLink) {
      console.log(
        "❌ Download limit reached or link expired"
      );

      return res.status(403).send(
        "Download limit reached or download link expired."
      );
    }

    downloadReserved = true;
    reservedLinkId = reservedLink._id.toString();

    console.log(
      `📥 Download reserved: ${reservedLink.successfulDownloads}/${reservedLink.maxDownloads}`
    );

    // ---------------------------------------
    // 4. Make sure product exists
    // ---------------------------------------
    const product = link.product as any;

    if (!product) {
      throw new Error(
        "Product associated with this download link was not found."
      );
    }

    // ---------------------------------------
    // 5. Validate template
    // ---------------------------------------
    if (!product.templatePath) {
      throw new Error(
        `Product ${product.slug} has no templatePath configured.`
      );
    }

    console.log(
      `📦 Creating ZIP for ${product.name}...`
    );

    // ---------------------------------------
    // 6. Create temporary ZIP
    // ---------------------------------------
    zipPath = await createTemplateZip({
      templatePath: product.templatePath,
      slug: product.slug,
    });

    console.log(
      `✅ ZIP ready: ${zipPath}`
    );

    // ---------------------------------------
    // 7. Make sure ZIP exists
    // ---------------------------------------
    if (!zipPath || !fs.existsSync(zipPath)) {
      throw new Error(
        "Generated ZIP does not exist."
      );
    }

    // ---------------------------------------
    // 8. Send ZIP
    // ---------------------------------------
    res.download(
      zipPath,
      `${product.slug}.zip`,
      async (error) => {
        if (error) {
          console.error(
            "❌ Download transfer error:",
            error
          );

          // -----------------------------------
          // Restore reservation
          // -----------------------------------
          if (downloadReserved && reservedLinkId) {
            try {
              await DownloadLink.findByIdAndUpdate(
                reservedLinkId,
                {
                  $inc: {
                    successfulDownloads: -1,
                  },
                }
              );

              console.log(
                "↩️ Download reservation restored"
              );
            } catch (restoreError) {
              console.error(
                "❌ Failed to restore download reservation:",
                restoreError
              );
            }
          }
        } else {
          console.log(
            `✅ Download completed for ${product.name}`
          );

          console.log(
            `📥 Download reserved successfully: ${reservedLink.successfulDownloads}/${reservedLink.maxDownloads}`
          );
        }

        // -----------------------------------
        // Delete temporary ZIP
        // -----------------------------------
        if (zipPath && fs.existsSync(zipPath)) {
          fs.unlink(zipPath, (deleteError) => {
            if (deleteError) {
              console.error(
                "❌ Failed to delete temporary ZIP:",
                deleteError
              );
            } else {
              console.log(
                `🗑️ Temporary ZIP deleted: ${zipPath}`
              );
            }
          });
        }
      }
    );

  } catch (error) {
    console.error(
      "❌ Download error:",
      error
    );

    // ---------------------------------------
    // Restore reserved download
    // ---------------------------------------
    if (downloadReserved && reservedLinkId) {
      try {
        await DownloadLink.findByIdAndUpdate(
          reservedLinkId,
          {
            $inc: {
              successfulDownloads: -1,
            },
          }
        );

        console.log(
          "↩️ Download reservation restored after error"
        );
      } catch (restoreError) {
        console.error(
          "❌ Failed to restore download reservation:",
          restoreError
        );
      }
    }

    // ---------------------------------------
    // Clean up ZIP
    // ---------------------------------------
    if (zipPath && fs.existsSync(zipPath)) {
      try {
        fs.unlinkSync(zipPath);

        console.log(
          `🗑️ ZIP cleaned up: ${zipPath}`
        );
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

