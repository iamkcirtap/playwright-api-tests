export class APIClient {
  constructor(request) {
    this.request = request;
  }

  async get(endpoint) {
    return await this.request.get(endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.CACHED_AUTH_TOKEN}`, // ✅ Uses pre-fetched token
      },
    });
  }
}
