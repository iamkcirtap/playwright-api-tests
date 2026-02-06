import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()]
});

test('Should fail with invalid refresh token', async ({ request }) => {
  const api = new APIClient(request);

  logger.info('🔄 First API call - should work with initial token');
  let response = await api.get('/users');
  expect(response.status()).toBe(200);
  logger.info('✅ First API call succeeded');

  logger.info('⏳ Setting refresh token to an invalid one...');
  await api.mockInvalidRefreshToken();

  logger.info('🔄 Trying to refresh with invalid token...');
  response = await request.post('/auth/refresh', {
    data: { refresh_token: 'invalid-refresh-token' },
  });

  expect(response.status()).toBe(401);
  const errorResponse = await response.json();
  expect(errorResponse.error).toBe('Invalid refresh token');

  logger.info('✅ Refresh failed as expected (Invalid token detected)');
});
