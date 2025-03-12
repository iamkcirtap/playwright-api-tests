import { test, expect } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';

test('GET users list', async ({ request }) => {
  const api = new APIClient(request);
  const response = await api.get('/users');

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.length).toBeGreaterThan(0);
  console.log(data);
});
