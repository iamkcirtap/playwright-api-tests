import { defineConfig } from '@playwright/test';
import fs from 'fs';

let cachedToken = '';
if (fs.existsSync('./auth-token.json')) {
  const authData = JSON.parse(fs.readFileSync('./auth-token.json', 'utf-8'));
  cachedToken = authData.token;
  console.log(`🔐 Loaded Auth Token: ${cachedToken}`);
}

export default defineConfig({
  timeout: 30000,
  globalSetup: './global-setup.js',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
    extraHTTPHeaders: {
      Authorization: `Bearer ${cachedToken}`,
    },
  },
  reporter: [['html', { outputFolder: 'test-results' }]],
});
