import { defineConfig } from '@playwright/test';
import fs from 'fs';

let cachedToken = '';
(async () => {
  if (fs.existsSync('./auth-token.json')) {
    const authData = JSON.parse(await fs.promises.readFile('./auth-token.json', 'utf-8'));
  // console.log(`🔐 Loaded Auth Token: ${cachedToken}`);
    console.log(`🔐 Loaded Auth Token: ${cachedToken}`);
  }
})();

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
