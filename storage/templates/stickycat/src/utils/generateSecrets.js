const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const envFilePath = path.join(__dirname, "../../.env");
const envContents = fs.existsSync(envFilePath)
  ? fs.readFileSync(envFilePath, "utf8")
  : "";

const values = {
  JWT_SECRET: crypto.randomBytes(64).toString("hex"),
  REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString("hex"),
};

let lines = envContents
  .split("\n")
  .filter(
    (line) =>
      !line.startsWith("JWT_SECRET=") &&
      !line.startsWith("REFRESH_TOKEN_SECRET=")
  );

lines.push(`JWT_SECRET=${values.JWT_SECRET}`);
lines.push(`REFRESH_TOKEN_SECRET=${values.REFRESH_TOKEN_SECRET}`);

fs.writeFileSync(envFilePath, lines.join("\n").replace(/\n+$/, "\n"));

console.log("JWT_SECRET and REFRESH_TOKEN_SECRET generated successfully.");
console.log("The secret values were written to .env and were not printed.");
