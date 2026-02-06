let validTokens = new Set(['mocked-token']); // Track valid access tokens
let validRefreshTokens = new Set(['mocked-refresh-token']); // Track valid refresh tokens

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
          role: 'admin',
          expires_in: 5, // Token expires in 5 seconds
        },
      },
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock /auth/login:', await response.text());
  } else {
    console.log('✅ Mocked: POST /auth/login');
  }

  // Mock refresh token endpoint (POST /auth/refresh)
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priority: 5,
      request: {
        method: 'POST',
        url: '/auth/refresh',
        headers: { 'Content-Type': { contains: 'application/json' } },
        bodyPatterns: [{ contains: '"refresh_token":"' }],
      },
      response: {
        status: 200,
        jsonBody: {
          token: 'new-mocked-token',
          refresh_token: 'new-mocked-refresh-token',
          expires_in: 5,
        },
      },
      postServeActions: {
        "webhook": {
          "url": "http://localhost:8080/auth/update-valid-tokens",
          "method": "POST",
          "headers": { "Content-Type": "application/json" },
          "body": JSON.stringify({ "new_token": "new-mocked-token", "refresh_token": "new-mocked-refresh-token" })
        }
      }
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock /auth/refresh:', await response.text());
  } else {
    console.log('✅ Mocked: POST /auth/refresh');
  }

  // Mock refresh token failure (Invalid refresh token)
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priority: 1,
      request: {
        method: 'POST',
        url: '/auth/refresh',
        bodyPatterns: [{ contains: '"refresh_token":"invalid-refresh-token"' }]
      },
      response: {
        status: 401,
        jsonBody: { error: 'Invalid refresh token' },
      },
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock invalid refresh token scenario:', await response.text());
  } else {
    console.log('✅ Mocked: Invalid refresh token scenario');
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

  // Mock token verification
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: {
        method: 'GET',
        url: '/auth/validate',
        headers: { Authorization: { matches: 'Bearer .*' } },
      },
      response: {
        status: 200,
        jsonBody: { valid: true },
      },
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock /auth/validate:', await response.text());
  } else {
    console.log('✅ Mocked: GET /auth/validate');
  }

  // Mock role-based access control (Admin Access)
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: {
        method: 'GET',
        url: '/admin-dashboard',
        headers: {
          Authorization: { matches: 'Bearer .*' },
          Role: { equalTo: 'admin' }  // ✅ Ensure Role is explicitly checked
        }
      },
      response: {
        status: 200,
        jsonBody: { message: 'Welcome, Admin!' }
      }
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock Admin Dashboard (Admin Access):', await response.text());
  } else {
    console.log('✅ Mocked: Admin Dashboard (Admin Access) with Role Check');
  }

  // Mock response for regular users (403 Forbidden)
  response = await fetch('http://localhost:8080/__admin/mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: {
        method: 'GET',
        url: '/admin-dashboard',
        headers: {
          Authorization: { matches: 'Bearer .*' },
          Role: { equalTo: 'user' }
        }
      },
      response: {
        status: 403,
        jsonBody: { error: 'Forbidden: Admin access required' }
      }
    }),
  });

  if (!response.ok) {
    console.error('❌ Failed to mock Admin Dashboard (User Access):', await response.text());
  } else {
    console.log('✅ Mocked: Admin Dashboard (User Access)');
  }

}

setupMocks();
