import fs from 'fs';
import path from 'path';

export class APIClient {
  constructor(request) {
    this.request = request;
    this.tokenFile = path.join(process.cwd(), 'auth-token.json');
  }

  async get(endpoint, role = 'user') {
    const headers = this.getAuthHeaders(role);

    console.log(`📡 Sending GET ${endpoint} with headers:`, headers); // ✅ Debugging log

    return await this.request.get(endpoint, { headers });
  }

  getAuthHeaders(role) {
    let token = this.loadToken();
    console.log(`📡 Sending request with headers:`, { 
      Authorization: `Bearer ${token}`, 
      Role: role
    });
    return { 
      Authorization: `Bearer ${token}`, 
      Role: role
    };
  }

  loadToken() {
    if (fs.existsSync(this.tokenFile)) {
      const authData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf-8'));
      return authData.token || '';
    }
    return '';
  }

  async mockTokenExpiration() {
    console.log('⏳ Simulating token expiration...');

    if (fs.existsSync(this.tokenFile)) {
      let authData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf-8'));
      authData.expiry = Date.now() - 1000; // Expire token immediately
      fs.writeFileSync(this.tokenFile, JSON.stringify(authData));
    }

    console.log('⚠️ Token expired! Next request should trigger refresh.');
    
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s to simulate expiry
  }

  async mockInvalidRefreshToken() {
    console.log('⏳ Simulating invalid refresh token...');

    if (fs.existsSync(this.tokenFile)) {
      let authData = JSON.parse(fs.readFileSync(this.tokenFile, 'utf-8'));
      authData.refresh_token = 'invalid-refresh-token'; // Set invalid token
      fs.writeFileSync(this.tokenFile, JSON.stringify(authData));
    }

    console.log('⚠️ Invalid refresh token set! Next refresh attempt should fail.');
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
