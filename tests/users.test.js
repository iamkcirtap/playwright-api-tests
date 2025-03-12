import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient';

test('should return a list of users with authentication', async ({ request }) => {
  const api = new APIClient(request);

  const response = await api.get('/users');
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy(); // ✅ Ensure response is an array
  expect(data.length).toBeGreaterThan(0);   // ✅ Validate non-empty list

  // Use a proper logging mechanism for production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`✅ Users response:`, data);
  }
});
