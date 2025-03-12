import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';

test('GET users list with authentication', async ({ request }) => {
  const api = new APIClient(request);

  const response = await api.get('/users');
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy(); // ✅ Ensure response is an array
  expect(data.length).toBeGreaterThan(0);   // ✅ Validate non-empty list

  console.log(`✅ Users response:`, data);
});
