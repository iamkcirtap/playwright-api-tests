import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';

test('Token should expire and refresh automatically', async ({ request }) => {
  const api = new APIClient(request);

  console.log('🔄 First API call - should work with initial token');
  let response = await api.get('/users');
  expect(response.status()).toBe(200);
  console.log('✅ First API call succeeded');

  console.log('⏳ Waiting for token to expire...');
  await new Promise((r) => setTimeout(r, 6000)); // Wait 6s (token expires at 5s)

  console.log('🔄 Second API call - should trigger refresh token flow');
  response = await api.get('/users');
  expect(response.status()).toBe(200);
  console.log('✅ Second API call succeeded (token refreshed)');
});
