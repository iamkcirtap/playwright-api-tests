import { request } from '@playwright/test';
import { getAuthToken } from './utils/auth.js';

async function globalSetup() {
  console.log('Running global setup to fetch auth token...');

  const requestContext = await request.newContext();
  try {
    const token = await getAuthToken(requestContext);
    console.log(`Cached auth token: ${token}`);
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;
