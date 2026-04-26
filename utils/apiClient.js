import fs from 'fs';
import path from 'path';
import logger from './logger.js';

export class APIClient {
  constructor(request, workerIndex = 0) {
    this.request = request;
    this.workerIndex = workerIndex;
    // Use worker-scoped token file to avoid conflicts in parallel execution
    this.tokenFile = path.join(process.cwd(), `auth-token-worker-${workerIndex}.json`);
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
  }

  async get(endpoint, role = 'user') {
    try {
      await this.ensureValidToken();
      const headers = this.getAuthHeaders(role);

      logger.info(`📡 Sending GET ${endpoint} with role: ${role}`);

      return await this.request.get(endpoint, { headers });
    } catch (error) {
      logger.error(`GET ${endpoint} failed: ${error.message}`);
      throw error;
    }
  }

  async ensureValidToken() {
    const authData = this.loadAuthData();
    const now = Date.now();

    // Token is still valid
    if (authData.token && now < authData.expiry) {
      return;
    }

    // Try to refresh if we have a refresh token
    if (authData.refresh_token) {
      logger.info('Token expired, attempting refresh...');
      try {
        await this.refreshToken();
      } catch (error) {
        logger.error(`Token refresh failed, falling back to login: ${error.message}`);
        await this.login();
      }
      return;
    }

    // No token or refresh token - login to get new one
    logger.info('No valid token found, logging in...');
    await this.login();
  }

  async login() {
    try {
      const testUsername = process.env.TEST_USERNAME || 'testuser';
      const testPassword = process.env.TEST_PASSWORD || 'testpass';
      
      const loginResponse = await this.request.post(`${this.apiBaseUrl}/auth/login`, {
        data: { username: testUsername, password: testPassword },
      });

      if (loginResponse.status() !== 200) {
        const responseBody = await loginResponse.json().catch(() => ({}));
        throw new Error(
          `Login to ${this.apiBaseUrl}/auth/login failed (status ${loginResponse.status()}): ${
            responseBody?.error || 'unknown error'
          }`
        );
      }

      const responseBody = await loginResponse.json();
      const now = Date.now();
      const newAuthData = {
        token: responseBody.token,
        refresh_token: responseBody.refresh_token,
        expiry: now + responseBody.expires_in * 1000,
      };

      fs.writeFileSync(this.tokenFile, JSON.stringify(newAuthData));
      logger.info('✅ Logged in successfully, token saved');
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const authData = this.loadAuthData();
      logger.info(`Refreshing token using refresh_token from ${this.tokenFile}`);

      const refreshResponse = await this.request.post(`${this.apiBaseUrl}/auth/refresh`, {
        data: { refresh_token: authData.refresh_token },
      });

      if (refreshResponse.status() === 200) {
        const refreshData = await refreshResponse.json();
        const now = Date.now();
        const newAuthData = {
          token: refreshData.token,
          refresh_token: refreshData.refresh_token,
          expiry: now + refreshData.expires_in * 1000,
        };

        fs.writeFileSync(this.tokenFile, JSON.stringify(newAuthData));
        logger.info('✅ Token refreshed successfully');
        return;
      }

      const responseBody = await refreshResponse.json().catch(() => ({}));
      throw new Error(
        `Refresh to ${this.apiBaseUrl}/auth/refresh failed (status ${refreshResponse.status()}): ${
          responseBody?.error || 'unknown error'
        }`
      );
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }

  getAuthHeaders(role) {
    const authData = this.loadAuthData();
    return { 
      Authorization: `Bearer ${authData.token}`, 
      Role: role
    };
  }

  loadAuthData() {
    if (fs.existsSync(this.tokenFile)) {
      const authData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf-8'));
      return {
        token: authData.token || '',
        refresh_token: authData.refresh_token || '',
        expiry: authData.expiry || 0,
      };
    }
    return { token: '', refresh_token: '', expiry: 0 };
  }

  loadToken() {
    return this.loadAuthData().token;
  }

  async mockTokenExpiration() {
    logger.info('⏳ Simulating token expiration...');

    if (fs.existsSync(this.tokenFile)) {
      let authData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf-8'));
      authData.expiry = Date.now() - 1000; // Expire token immediately
      fs.writeFileSync(this.tokenFile, JSON.stringify(authData));
    }

    logger.warn('⚠️ Token expired! Next request should trigger refresh.');
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async mockInvalidRefreshToken() {
    logger.info('⏳ Simulating invalid refresh token...');

    if (fs.existsSync(this.tokenFile)) {
      let authData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf-8'));
      authData.refresh_token = 'invalid-refresh-token'; // Set invalid token
      fs.writeFileSync(this.tokenFile, JSON.stringify(authData));
    }

    logger.warn('⚠️ Invalid refresh token set! Next refresh attempt should fail.');
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
