export class APIClient {
  constructor(request) {
    this.request = request;
  }

  async get(endpoint) {
    return this.request.get(endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.CACHED_AUTH_TOKEN}`, // ✅ Uses pre-fetched token
      },
    });
  }

  getAuthToken() {
    const token = process.env.CACHED_AUTH_TOKEN;
    if (!token) {
      throw new Error('CACHED_AUTH_TOKEN is not set');
    }
    // Additional validation logic for the token can be added here
    return token;
  }
}
