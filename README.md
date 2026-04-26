# Playwright API Tests

A comprehensive Playwright test suite for API testing with **JWT token authentication**, **automatic token refresh**, and **role-based access control (RBAC)** testing.

## Quick Start

### Prerequisites

- Node.js (v18+)
- Java (required for WireMock mock server)

### Setup

```bash
# Install dependencies
npm install

# Start WireMock mock server (in separate terminal)
npm run start:wiremock

# Setup mock endpoints
npm run setup:wiremock

# Run tests
npm test
```

## Features

✅ **Token-Based Authentication**
- Automatic JWT token fetching and caching
- Built-in token expiration detection
- Seamless token refresh on expiration

✅ **Worker-Scoped Token Isolation**
- Each Playwright worker gets isolated token state
- Safe for parallel test execution
- No test interference or state leaks

✅ **Comprehensive Error Handling**
- Throws on critical failures with context
- Descriptive error messages including endpoint and response details
- Consistent logging across the codebase

✅ **Role-Based Access Control Testing**
- Admin vs. regular user access testing
- Permission validation
- Forbidden access scenarios

✅ **Test Cleanup & Isolation**
- Automatic token file cleanup before/after each test
- Fresh authentication per test
- Fixture-based setup/teardown

## Running Tests

```bash
# Run all tests (parallel execution)
npm test

# Run single test file
npx playwright test tests/users.test.js

# Run tests matching a pattern
npx playwright test --grep "token"

# Run sequentially (for debugging)
npx playwright test -- --workers=1

# Run with verbose output
npx playwright test --reporter=list

# View HTML test report
npx playwright show-report
```

## Configuration

### Environment Variables

Create or update `.env` file:

```bash
# API Server
API_BASE_URL=http://localhost:8080

# Test Credentials
TEST_USERNAME=testuser
TEST_PASSWORD=testpass

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

## Project Structure

```
playwright-api-tests/
├── tests/
│   ├── users.test.js           # Happy path: fetch users
│   ├── token-refresh.test.js   # Token expiration & refresh
│   ├── role-access.test.js     # RBAC: admin vs user
│   └── invalid-refresh.test.js # Error: invalid refresh token
│
├── utils/
│   ├── apiClient.js            # Authenticated HTTP client
│   ├── auth.js                 # Authentication logic
│   ├── fixtures.js             # Test cleanup fixtures
│   └── logger.js               # Winston logging utility
│
├── mocks/
│   └── auth-mock.js            # WireMock endpoint setup
│
├── global-setup.js             # Pre-test initialization
├── playwright.config.js        # Test configuration
├── package.json                # Dependencies
└── .env                        # Environment variables
```

## Architecture

### Authentication Flow

```
1. Global Setup (runs once)
   ↓
   Fetch auth token via POST /auth/login
   Save to auth-token-worker-{workerIndex}.json
   ↓
2. Before Each Test
   Delete stale token file (via fixture)
   ↓
3. During Each Test
   api.get('/endpoint')
   ↓ calls ensureValidToken()
   ├─ If token valid → continue
   ├─ If token expired → refreshToken()
   └─ If no token → throw error
   ↓
4. After Each Test
   Delete token file (via fixture)
   Clean up test state
```

### Token File Structure

Each worker maintains its own token file: `auth-token-worker-{workerIndex}.json`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh-token-string",
  "expiry": 1234567890000
}
```

## API Client Usage

```javascript
import { test } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';

test('example', async ({ request, parallelIndex }) => {
  const api = new APIClient(request, parallelIndex);
  
  // Automatically handles token validation/refresh
  const response = await api.get('/users', 'user');
  expect(response.status()).toBe(200);
});
```

### APIClient Methods

- `get(endpoint, role)` - Make authenticated GET request
- `ensureValidToken()` - Validate token, refresh if needed
- `refreshToken()` - Refresh JWT token
- `mockTokenExpiration()` - Simulate expired token
- `mockInvalidRefreshToken()` - Simulate refresh failure

## Error Handling

The test suite throws descriptive errors on critical failures:

```
❌ Bad: "Authentication failed: 401"

✅ Good: "Login to http://localhost:8080/auth/login failed (status 401): invalid credentials"
```

All errors are logged with appropriate levels:
- `error` - Critical failures (should fail the test)
- `warn` - Recoverable issues (retry logic, fallbacks)
- `info` - Normal flow (setup, requests, status)
- `debug` - Detailed debugging info

## WireMock Mock Server

### Starting the Server

```bash
npm run start:wiremock
```

Server runs on `http://localhost:8080` and responds to:
- `POST /auth/login` - Login and get JWT token
- `POST /auth/refresh` - Refresh expired token
- `GET /users` - Fetch users list (auth required)
- `GET /admin-dashboard` - Admin endpoint (role-based access)

### Setting Up Mocks

```bash
npm run setup:wiremock
```

Configures all mock endpoints to respond with test data.

## Parallel vs Sequential Execution

**Default: Parallel** (faster)
```bash
npm test  # Runs in parallel by default
```

**Sequential** (for debugging)
```bash
npx playwright test -- --workers=1
```

Parallel execution is safe because each worker:
- Gets its own token file: `auth-token-worker-{index}.json`
- Cleans up tokens before/after each test
- Never conflicts with other workers

## Logging

Winston logger provides consistent output:

```javascript
import logger from './utils/logger.js';

logger.info('Starting operation');      // Normal flow
logger.debug('Token is still valid');   // Detailed info
logger.warn('Refresh failed, retrying');// Warning
logger.error('Cannot proceed');         // Error
```

Set `LOG_LEVEL=debug` in `.env` for verbose output.

## Key Conventions

- **ES Modules** - All files use `import`/`export` with full extensions
- **Worker-Scoped Tokens** - Each Playwright worker gets isolated token state
- **Throw on Critical Errors** - Don't silently swallow failures
- **Fixture-Based Cleanup** - Automatic state cleanup per test
- **Environment-Based Config** - All secrets/URLs in `.env`

## Common Issues

### Tests Fail Immediately

**Cause:** WireMock server not running

**Fix:**
```bash
npm run start:wiremock  # In separate terminal
npm run setup:wiremock  # Setup endpoints
npm test                # Run tests
```

### Token Expired During Test

**Cause:** Mock token expires quickly (5 seconds)

**Info:** This is intentional to test the token refresh logic. The test should auto-refresh and continue.

### Tests Pass Individually but Fail Together

**Cause:** Running with multiple workers and token state conflicts

**Fix:** Use sequential execution
```bash
npx playwright test -- --workers=1
```

## Contributing

See `.github/copilot-instructions.md` for detailed development guidelines, architecture decisions, and testing patterns.

## License

ISC