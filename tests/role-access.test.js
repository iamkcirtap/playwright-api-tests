import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';
import logger from '../utils/logger.js';

test('Admin should have access to admin dashboard', async ({ request }, testInfo) => {
  const api = new APIClient(request, testInfo.parallelIndex);

  logger.info('🔄 Fetching admin dashboard with admin role');
  let response = await api.get('/admin-dashboard', 'admin');
  logger.info(`🔄 Received status: ${response.status()}`);

  expect(response.status()).toBe(200);

  const data = await response.json();
  logger.debug(`Response body: ${JSON.stringify(data)}`);

  expect(data).toHaveProperty('message', 'Welcome, Admin!');

  logger.info('✅ Admin access granted');
});

test('Regular user should be denied admin access', async ({ request }, testInfo) => {
  const api = new APIClient(request, testInfo.parallelIndex);

  logger.info('🔄 Fetching admin dashboard with user role');
  let response = await api.get('/admin-dashboard', 'user');
  logger.info(`🔄 Received status: ${response.status()}`);

  expect(response.status()).toBe(403);

  const errorResponse = await response.json();
  logger.debug(`Response body: ${JSON.stringify(errorResponse)}`);

  expect(errorResponse).toHaveProperty('error', 'Forbidden: Admin access required');

  logger.info('✅ Regular user access denied as expected');
});

