//src/utils/generateSecrets.ts
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Load existing secrets from .env if it exists
const envFilePath = path.join(__dirname, '../../.env');
const envContents = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf-8') : '';

// Generate a new refresh token secret
const refreshTokenSecret = crypto.randomBytes(64).toString('hex');

// Combine existing secrets with the new refresh token secret
let secrets = envContents.split('\n').filter(line => !line.startsWith('REFRESH_TOKEN_SECRET')).join('\n');
secrets += `\nREFRESH_TOKEN_SECRET=${refreshTokenSecret}\n`;

// Save the updated secrets back to the .env file
fs.writeFileSync(envFilePath, secrets);

