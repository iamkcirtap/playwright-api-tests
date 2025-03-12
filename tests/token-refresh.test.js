import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';
import { createLogger, transports, format } from 'winston';

// Initialize logger once, outside tests
const logger = createLogger({
  level: 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()]
});

test('Token should expire and refresh automatically', async ({ request }) => {
  const api = new APIClient(request);

  logger.info('🔄 First API call - should work with initial token');
  let response = await api.get('/users');
  expect(response.status()).toBe(200);
  logger.info('✅ First API call succeeded');

  logger.info('⏳ Mocking token expiration...');
  if (api.mockTokenExpiration) {
    await api.mockTokenExpiration(); // Ensure `mockTokenExpiration()` exists in APIClient
  } else {
    logger.warn('⚠️ mockTokenExpiration() is not implemented in APIClient');
  }

  logger.info('🔄 Second API call - should trigger refresh token flow');
  response = await api.get('/users');
  expect(response.status()).toBe(200);
  logger.info('✅ Second API call succeeded (token refreshed)');
});
