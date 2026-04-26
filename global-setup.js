import { request } from '@playwright/test';
import { getAuthToken } from './utils/auth.js';
import logger from './utils/logger.js';

async function globalSetup() {
  logger.info('Running global setup to fetch auth token...');

  const requestContext = await request.newContext();
  try {
    const token = await getAuthToken(requestContext);
    logger.info(`Cached auth token: ${token}`);
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;
