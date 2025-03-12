import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const tokenFile = path.join(process.cwd(), 'auth-token.json');

async function getAuthToken(request) {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
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
    console.log('✅ Using cached token');
    return cachedToken;
  }

  // Refresh token if expired
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

      // Save the new token
      fs.writeFileSync(tokenFile, JSON.stringify({ token: cachedToken, refresh_token: refreshToken, expiry: tokenExpiry }));
      return cachedToken;
    }
  }

  // Otherwise, fetch a new token
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

  // Save token
  fs.writeFileSync(tokenFile, JSON.stringify({ token: cachedToken, refresh_token: refreshToken, expiry: tokenExpiry }));

  return cachedToken;
}

export { getAuthToken };
