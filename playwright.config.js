import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  timeout: 30000,
  globalSetup: './global-setup.js',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
  },
  reporter: [['html', { outputFolder: 'test-results' }]],
});
