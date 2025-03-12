export class APIClient {
    constructor(request) {
      this.request = request;
    }
  
    async get(endpoint) {
      return await this.request.get(endpoint);
    }
  
    async post(endpoint, data) {
      return await this.request.post(endpoint, { data });
    }
  
    async delete(endpoint) {
      return await this.request.delete(endpoint);
    }
  }
  