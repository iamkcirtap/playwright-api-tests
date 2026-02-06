import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()]
});

test('Admin should have access to admin dashboard', async ({ request }) => {
  const api = new APIClient(request);

  logger.info('🔄 Fetching admin dashboard with admin role');
  let response = await api.get('/admin-dashboard', 'admin'); // ✅ Send admin role
  logger.info(`🔄 Received status: ${response.status()}`);

  expect(response.status()).toBe(200);

  const data = await response.json();
  logger.info(`🔄 Response body: ${JSON.stringify(data)}`);

  // Ensure the response contains the expected message
  expect(data).toHaveProperty('message', 'Welcome, Admin!');

  logger.info('✅ Admin access granted');
});

test('Regular user should be denied admin access', async ({ request }) => {
  const api = new APIClient(request);

  logger.info('🔄 Fetching admin dashboard with user role');
  let response = await api.get('/admin-dashboard', 'user');
  logger.info(`🔄 Received status: ${response.status()}`);

  expect(response.status()).toBe(403);

  const errorResponse = await response.json();
  logger.info(`🔄 Response body: ${JSON.stringify(errorResponse)}`);

  // Ensure the error message is present
  expect(errorResponse).toHaveProperty('error', 'Forbidden: Admin access required');

  logger.info('✅ Regular user access denied as expected');
});
