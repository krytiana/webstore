import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import axios from "axios";

export const pushTemplateToGitHub = async (
  zipPath: string,
  repoName: string,
  username: string,
  accessToken: string
) => {
  const extractPath = path.join(
    __dirname,
    "../../temp",
    repoName
  );

  // 1. Extract ZIP
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  // 2. Read all files recursively
  const getFiles = (dir: string, base = ""): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const relPath = path.join(base, file);

      if (fs.statSync(filePath).isDirectory()) {
        results = results.concat(getFiles(filePath, relPath));
      } else {
        results.push(relPath);
      }
    });

    return results;
  };

  const files = getFiles(extractPath);

  // 3. Upload each file to GitHub
  for (const file of files) {
    const fullPath = path.join(extractPath, file);
    const content = fs.readFileSync(fullPath, "base64");

    await axios.put(
      `https://api.github.com/repos/${username}/${repoName}/contents/${file}`,
      {
        message: "Initial template upload",
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
  }

  return true;
};