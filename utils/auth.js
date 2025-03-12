import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let cachedToken = null;
let refreshToken = null;
let tokenExpiry = 0;

async function getAuthToken(request) {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
  const now = Date.now();

  // Check if token is still valid
  if (cachedToken && now < tokenExpiry) {
    console.log('✅ Using cached token');
    return cachedToken;
  }

  // If token expired, try to refresh
  if (refreshToken) {
    console.log('🔄 Token expired, refreshing...');
    const refreshResponse = await request.post(`${apiBaseUrl}/auth/refresh`, {
      data: { refresh_token: refreshToken },
    });

    if (refreshResponse.status() === 200) {
      const refreshData = await refreshResponse.json();
      cachedToken = refreshData.token;
      refreshToken = refreshData.refresh_token;
      tokenExpiry = now + refreshData.expires_in * 1000;
      console.log(`🔄 Refreshed Auth Token: ${cachedToken}`);

      // Save token
      fs.writeFileSync('./auth-token.json', JSON.stringify({ token: cachedToken, refresh_token: refreshToken }));
      return cachedToken;
    }
  }

  // Otherwise, get a new token
  console.log('🔄 Fetching new auth token...');
  const response = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { username: 'testuser', password: 'testpass' },
  });

  if (response.status() !== 200) {
    throw new Error(`❌ Authentication failed: ${response.status()}`);
  }

  const responseBody = await response.json();
  cachedToken = responseBody.token;
  refreshToken = responseBody.refresh_token;
  tokenExpiry = now + responseBody.expires_in * 1000;

  console.log(`✅ New Auth Token: ${cachedToken}`);

  // Save token to file
  fs.writeFileSync('./auth-token.json', JSON.stringify({ token: cachedToken, refresh_token: refreshToken }));

  return cachedToken;
}

export { getAuthToken };
