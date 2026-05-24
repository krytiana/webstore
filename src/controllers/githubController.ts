// src/controllers/githubController.ts
import { Request, Response } from "express";
import axios from "axios";
import "express-session";
import path from "path";
import simpleGit from "simple-git";
import os from "os";
import fs from "fs";
import Product from "../models/ProductModel";
import { fstat } from "fs";



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
  try {

    const productId =
      req.session.currentProductId;

    if (!productId) {
      return res.status(400).send(
        "No product selected"
      );
    }

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).send(
        "Product not found"
      );
    }

    const {
      username,
      accessToken
    } = req.session.github!;

    const repoName =
      req.session.githubRepoName!;

    const tempDir = path.join(
      os.tmpdir(),
      `clone-test-${Date.now()}`
    );

    const git = simpleGit();

    await git.clone(
      `https://${process.env.GITHUB_PAT}@github.com/krytiana/megamall.git`,
      tempDir
    );

    const repoGit = simpleGit(tempDir);

    // Remove template repo remote
    await repoGit.removeRemote("origin");

    // Add customer repo remote
    await repoGit.addRemote(
      "origin",
      `https://${accessToken}@github.com/${username}/${repoName}.git`
    );

    await repoGit.push(
      "origin",
      "main",
      { "--force": null }
    );

    req.session.sourceCodePushed = true;

    return res.redirect(
      `/deploy/${productId}`
    );

  } catch (error: any) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
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