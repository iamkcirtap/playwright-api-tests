import fs from 'fs';
import path from 'path';

export class APIClient {
  constructor(request) {
    this.request = request;
    this.tokenFile = path.join(process.cwd(), 'auth-token.json');
  }

  async get(endpoint) {
    const headers = this.getAuthHeaders();
    return await this.request.get(endpoint, { headers });
  }

  getAuthHeaders() {
    let token = this.loadToken();
    return { Authorization: `Bearer ${token}` };
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
}
