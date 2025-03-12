import { request } from '@playwright/test';
import { getAuthToken } from './utils/auth.js';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('🔄 Running global setup to fetch auth token...');

  const requestContext = await request.newContext();
  const token = await getAuthToken(requestContext);

  console.log(`🔐 Cached Auth Token: ${token}`);

  // Save token to file
  fs.writeFileSync(path.join(__dirname, 'auth-token.json'), JSON.stringify({ token }));
}

export default globalSetup;
