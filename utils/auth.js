import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import logger from './logger.js';

dotenv.config();

const tokenFile = path.join(process.cwd(), 'auth-token.json');

async function getAuthToken(request) {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
  const testUsername = process.env.TEST_USERNAME || 'testuser';
  const testPassword = process.env.TEST_PASSWORD || 'testpass';
  const now = Date.now();

  // Load token from file
  let cachedToken = '';
  let refreshToken = '';
  let tokenExpiry = 0;

  if (fs.existsSync(tokenFile)) {
    const authData = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'));
    cachedToken = authData.token || '';
    refreshToken = authData.refresh_token || '';
    tokenExpiry = authData.expiry || 0;
  }

  // Use cached token if it's still valid
  if (cachedToken && now < tokenExpiry) {
    logger.info('Using cached token');
    return cachedToken;
  }

  // Refresh token if expired
  if (refreshToken) {
    logger.info('Token expired, refreshing...');

    try {
      const refreshResponse = await request.post(`${apiBaseUrl}/auth/refresh`, {
        data: { refresh_token: refreshToken },
      });

      if (refreshResponse.status() === 200) {
        const refreshData = await refreshResponse.json();
        cachedToken = refreshData.token;
        refreshToken = refreshData.refresh_token;
        tokenExpiry = now + refreshData.expires_in * 1000;

        logger.info(`Refreshed auth token: ${cachedToken}`);

        // Save the new token
        fs.writeFileSync(
          tokenFile,
          JSON.stringify({ token: cachedToken, refresh_token: refreshToken, expiry: tokenExpiry })
        );
        return cachedToken;
      }

      const errorMsg = `Refresh failed with status ${refreshResponse.status()}`;
      logger.warn(`${errorMsg}, falling back to login.`);
    } catch (error) {
      logger.warn(`Refresh request failed, falling back to login: ${error.message}`);
    }
  }

  // Otherwise, fetch a new token
  logger.info('Fetching new auth token...');
  try {
    const response = await request.post(`${apiBaseUrl}/auth/login`, {
      data: { username: testUsername, password: testPassword },
    });

    if (response.status() !== 200) {
      const responseBody = await response.json().catch(() => ({}));
      throw new Error(
        `Login to ${apiBaseUrl}/auth/login failed (status ${response.status()}): ${
          responseBody?.error || 'unknown error'
        }`
      );
    }

    const responseBody = await response.json();
    cachedToken = responseBody.token;
    refreshToken = responseBody.refresh_token;
    tokenExpiry = now + responseBody.expires_in * 1000;

    logger.info(`New auth token: ${cachedToken}`);

    // Save token
    fs.writeFileSync(tokenFile, JSON.stringify({ token: cachedToken, refresh_token: refreshToken, expiry: tokenExpiry }));

    return cachedToken;
  } catch (error) {
    logger.error(`Authentication failed: ${error.message}`);
    throw error;
  }
}

export { getAuthToken };
