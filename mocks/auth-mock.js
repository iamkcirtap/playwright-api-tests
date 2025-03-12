let validTokens = new Set(['mocked-token']); // Track valid tokens

async function setupMocks() {
  console.log('🔄 Setting up WireMock stubs...');

 // Mock authentication endpoint (POST /auth/login)
 let response = await fetch('http://localhost:8080/__admin/mappings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request: { method: 'POST', url: '/auth/login' },
    response: {
      status: 200,
      jsonBody: {
        token: 'mocked-token',
        refresh_token: 'mocked-refresh-token',
        expires_in: 5, // Expire in 5 seconds
      },
    },
  }),
});

  if (!response.ok) {
    console.error('❌ Failed to mock /auth/login:', await response.text());
  } else {
    console.log('✅ Mocked: POST /auth/login');
  }

  // Mock GET /users with token validation
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: {
        method: 'GET',
        url: '/users',
        headers: { Authorization: { matches: 'Bearer .*' } },
      },
      response: {
        status: 200,
        jsonBody: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Doe' },
        ],
      },
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock /users:', await response.text());
  } else {
    console.log('✅ Mocked: GET /users');
  }

  // Mock refresh token endpoint (POST /auth/refresh)
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: { method: 'POST', url: '/auth/refresh' },
      response: {
        status: 200,
        jsonBody: {
          token: 'new-mocked-token',
          refresh_token: 'new-mocked-refresh-token',
          expires_in: 5,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock /auth/refresh:', await response.text());
  } else {
    console.log('✅ Mocked: POST /auth/refresh');
  }
}

setupMocks();
