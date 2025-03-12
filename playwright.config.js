import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000, // 30 seconds timeout
  use: {
    baseURL: 'https://jsonplaceholder.typicode.com', // Change this for real API
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  reporter: [['html', { outputFolder: 'test-results' }]], // Generates test reports
});
