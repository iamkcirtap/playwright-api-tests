import { request } from '@playwright/test';
import { getAuthToken } from './utils/auth.js';
import fs from 'fs';

async function globalSetup() {
  console.log('🔄 Running global setup to fetch auth token...');

  const requestContext = await request.newContext();
  const token = await getAuthToken(requestContext);

  console.log(`🔐 Cached Auth Token: ${token}`);

  // Save token to file
  fs.writeFileSync('./auth-token.json', JSON.stringify({ token }));
}

export default globalSetup;
