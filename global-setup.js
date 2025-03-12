import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { request } from '@playwright/test';
import { getAuthToken } from './utils/auth.js';
import fs from 'fs';

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function globalSetup() {
  console.log('🔄 Running global setup to fetch auth token...');

  const requestContext = await request.newContext();
  const token = await getAuthToken(requestContext);

  console.log(`🔐 Cached Auth Token: ${token}`);

  // Save token to file
  fs.writeFileSync(join(__dirname, 'auth-token.json'), JSON.stringify({ token }));
}

export default globalSetup;
