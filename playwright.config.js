import { defineConfig, test } from '@playwright/test';
import dotenv from 'dotenv';
import { createTokenFixture } from './utils/fixtures.js';

dotenv.config();

export default defineConfig({
  timeout: 30000,
  globalSetup: './global-setup.js',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
  },
  reporter: [['html', { outputFolder: 'test-results' }]],
});

// Define the tokenCleanup fixture
export const testWithTokenCleanup = test.extend({
  tokenCleanup: createTokenFixture(),
});
