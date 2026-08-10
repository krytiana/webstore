// src/controllers/githubController.ts
import { Request, Response } from "express";
import axios from "axios";
import "express-session";
import path from "path";
import simpleGit from "simple-git";
import os from "os";
import fs from "fs";
import Product from "../models/ProductModel";
import { getTemplateDirectory } from "../utils/templateStorage";



declare module "express-session" {
  interface SessionData {
    github?: {
      id: number;
      username: string;
      email?: string;
      accessToken: string;
    };

    currentProductId?: string;

    githubRepoUrl?: string;
    githubRepoName?: string;

    sourceCodePushed?: boolean;
  }
}

export const githubLogin = (
  req: Request,
  res: Response
) => {

  const productId = req.query.productId as string;

  req.session.currentProductId = productId;

  const clientId = process.env.GITHUB_CLIENT_ID;

  const redirectUrl =
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user%20user:email%20repo`;

  res.redirect(redirectUrl);
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.send("No code provided");
    }

    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code
        }),
        {
            headers: {
            Accept: "application/json"
            }
        }
        );

    const accessToken = tokenResponse.data.access_token;

    // 2. Get user info from GitHub
    const userResponse = await axios.get(
      `https://api.github.com/user`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const githubUser = userResponse.data;

    // 3. Save to session or database
    req.session.github = {
      id: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      accessToken
    };
    


    // 4. Redirect back to deploy page
    const productId = req.session.currentProductId;

    if (!productId) {
      return res.redirect("/dashboard");
    }

    // Optional: log success
    console.log(
      `GitHub connected: ${githubUser.login} (${githubUser.id})`
    );

    return res.redirect(`/deploy/${productId}`);

  } catch (error) {
    console.error(error);
    return res.status(500).send("GitHub auth failed");
  }
};

const checkRepoExists = async (
  username: string,
  repoName: string,
  token: string
) => {
  try {
    await axios.get(
      `https://api.github.com/repos/${username}/${repoName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return true; // repo exists
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false; // repo does not exist
    }
    throw error;
  }
};

export const createRepo = async (req: Request, res: Response) => {
  try {
    if (!req.session.github) {
      return res.status(401).json({
        success: false,
        message: "GitHub not connected"
      });
    }

    const { repoName } = req.body;
    const { username, accessToken } = req.session.github;

    // 1. CHECK IF REPO EXISTS
    const exists = await checkRepoExists(
      username,
      repoName,
      accessToken
    );

    const repoUrl = `https://github.com/${username}/${repoName}`;

    if (exists) {
      req.session.githubRepoUrl = repoUrl;
      req.session.githubRepoName = repoName;

      console.log("Repo already exists, reusing it");

      return res.redirect(`/deploy/${req.session.currentProductId}`);
    }

    // 2. CREATE REPO IF NOT EXISTS
    await axios.post(
      "https://api.github.com/user/repos",
      {
        name: repoName,
        private: true
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    req.session.githubRepoUrl = repoUrl;
    req.session.githubRepoName = repoName;
    console.log("Repo created:", repoUrl);

    return res.redirect(`/deploy/${req.session.currentProductId}`);

  } catch (error: any) {
    console.error(error.response?.data || error);

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to create repository"
    });
  }
};

export const deployToRepo = async (
  req: Request,
  res: Response
) => {
  let tempDir: string | null = null;

  try {
    // ---------------------------------------
    // 1. Get product
    // ---------------------------------------
    const productId = req.session.currentProductId;

    if (!productId) {
      return res.status(400).send("No product selected");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // ---------------------------------------
    // 2. Get GitHub session
    // ---------------------------------------
    const github = req.session.github;

    if (!github) {
      return res.status(401).send("GitHub not connected");
    }

    const {
      username,
      accessToken,
      id: githubId
    } = github;

    const repoName = req.session.githubRepoName;

    if (!repoName) {
      return res.status(400).send(
        "GitHub repository not configured"
      );
    }

    // ---------------------------------------
    // 3. Validate template
    // ---------------------------------------
    if (!product.templatePath) {
      return res.status(400).send(
        "This product does not have a template configured."
      );
    }

    // ---------------------------------------
    // 4. Locate purchased template
    // ---------------------------------------
    const templateDirectory = getTemplateDirectory({
      templatePath: product.templatePath,
    });

    if (!fs.existsSync(templateDirectory)) {
      return res.status(404).send(
        "Template source code not found."
      );
    }

    console.log(
      `📦 Using template: ${templateDirectory}`
    );

    // ---------------------------------------
    // 5. Create temporary Git directory
    // ---------------------------------------
    tempDir = path.join(
      os.tmpdir(),
      `deploy-${product.slug}-${Date.now()}`
    );

    fs.mkdirSync(tempDir, {
      recursive: true,
    });

    console.log(
      `📁 Temporary deployment directory: ${tempDir}`
    );

    // ---------------------------------------
    // 6. Copy template into temp directory
    // ---------------------------------------
    await fs.promises.cp(
      templateDirectory,
      tempDir,
      {
        recursive: true,
        force: true,
      }
    );

    console.log(
      `✅ ${product.name} copied to deployment directory`
    );

    // ---------------------------------------
    // 7. Initialize Git repository
    // ---------------------------------------
    const repoGit = simpleGit(tempDir);

    await repoGit.init();

    // ---------------------------------------
    // 8. Configure Git identity
    // ---------------------------------------
    //
    // GitHub requires an identity when creating
    // the commit. Use the customer's GitHub
    // noreply identity.
    //
    const gitEmail =
      `${githubId}+${username}@users.noreply.github.com`;

    await repoGit.addConfig(
      "user.name",
      username
    );

    await repoGit.addConfig(
      "user.email",
      gitEmail
    );

    console.log(
      `👤 Git identity configured: ${username}`
    );

    // ---------------------------------------
    // 9. Add customer GitHub repository
    // ---------------------------------------
    const repoUrl =
      `https://${accessToken}@github.com/${username}/${repoName}.git`;

    await repoGit.addRemote(
      "origin",
      repoUrl
    );

    // ---------------------------------------
    // 10. Add template files
    // ---------------------------------------
    await repoGit.add(".");

    // ---------------------------------------
    // 11. Create commit
    // ---------------------------------------
    await repoGit.commit(
      `Deploy ${product.name}`
    );

    console.log(
      `✅ Source code committed for ${product.name}`
    );

    // ---------------------------------------
    // 12. Push to customer's repository
    // ---------------------------------------
    await repoGit.push(
      "origin",
      "main",
      {
        "--force": null,
      }
    );

    console.log(
      `🚀 ${product.name} pushed to GitHub`
    );

    // ---------------------------------------
    // 13. Remove authenticated remote
    // ---------------------------------------
    //
    // This prevents the access token from
    // remaining inside the temporary repo config.
    //
    await repoGit.removeRemote("origin");

    // ---------------------------------------
    // 14. Mark deployment complete
    // ---------------------------------------
    req.session.sourceCodePushed = true;

    return res.redirect(
      `/deploy/${productId}`
    );

  } catch (error: any) {

    console.error(
      "❌ GitHub deployment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to deploy source code",
    });

  } finally {

    // ---------------------------------------
    // 15. Delete temporary directory
    // ---------------------------------------
    if (tempDir && fs.existsSync(tempDir)) {
      try {

        await fs.promises.rm(
          tempDir,
          {
            recursive: true,
            force: true,
          }
        );

        console.log(
          `🗑️ Temporary deployment directory deleted: ${tempDir}`
        );

      } catch (cleanupError) {

        console.error(
          "❌ Failed to clean deployment directory:",
          cleanupError
        );

      }
    }
  }
};

// Deactivated function, no more used, but keeping it for reference in case we want to re-enable Render deployment in the future
// it route is removed from routes.ts and the button to trigger it is removed from the frontend, 
// so it won't be accessible by users, but we keep the code here for reference in case we want to re-enable it in the future
export const deployToRender = async (req: Request, res: Response) => {
  try {
    const productId = req.session.currentProductId;

    if (!productId) {
      return res.status(400).send("No product selected");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const repoName = req.session.githubRepoName;
    const github = req.session.github;

    if (!repoName || !github) {
      return res.status(400).send("Missing GitHub session data");
    }

    const repoFullName = `${github.username}/${repoName}`;

    const response = await axios.post(
      "https://api.render.com/v1/services",
      {
        type: "web_service",
        name: repoName,
        repo: repoFullName,
        branch: "main",
        runtime: "node",
        buildCommand: "npm install && npm run build",
        startCommand: "npm start"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      success: true,
      renderServiceId: response.data.id,
      message: "Render deployment started"
    });

  } catch (error: any) {
    console.error(error.response?.data || error);

    console.error(
      "RENDER ERROR:",
      error.response?.data || error
    );

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};