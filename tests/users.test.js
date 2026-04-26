import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';
import logger from '../utils/logger.js';

test('should return a list of users with authentication', async ({ request }, testInfo) => {
  const api = new APIClient(request, testInfo.parallelIndex);

  const response = await api.get('/users');
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);

  logger.debug(`Users response: ${JSON.stringify(data)}`);
});

