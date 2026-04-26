# Copilot Instructions for playwright-api-tests

## Quick Reference

**Project:** Playwright API test suite with token-based authentication and role-based access control testing

**Tech Stack:** Playwright Test, Node.js (ES modules), Winston logger, WireMock mock server

## Build & Test Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run single test file
npx playwright test tests/users.test.js

# Run tests matching a pattern
npx playwright test --grep "token"

# Run tests sequentially (debugging)
npx playwright test -- --workers=1

# Run with verbose output
npx playwright test --reporter=list

# View HTML test report
npx playwright show-report

# Start WireMock mock server (port 8080)
npm run start:wiremock

# Setup WireMock mocks
npm run setup:wiremock
```

## Architecture Overview

### Authentication Flow

The system uses **token-based authentication** with automatic refresh:

1. **Global Setup** (`global-setup.js`):
   - Runs once before all tests
   - Calls `getAuthToken()` to fetch initial token
   - Saves token to `auth-token-worker-{workerIndex}.json`

2. **Per-Request Token Management** (`utils/apiClient.js`):
   - Each API request calls `ensureValidToken()` first
   - Checks if token is expired (compares `now` vs `expiry` timestamp)
   - If expired, calls `refreshToken()` to get new token
   - If refresh fails, throws error (propagates to test)

3. **Credentials**:
   - Loaded from environment variables: `TEST_USERNAME`, `TEST_PASSWORD`
   - Defaults to `'testuser'` and `'testpass'` if env vars not set
   - Used in `getAuthToken()` for `/auth/login` endpoint

### Token File Structure

Each Playwright worker gets an isolated token file: `auth-token-worker-{workerIndex}.json`

```json
{
  "token": "jwt-token-string",
  "refresh_token": "refresh-token-string",
  "expiry": 1234567890000
}
```

**Why worker-scoped?** Prevents race conditions in parallel test execution. Each worker manages its own token independently.

### Test Organization

```
tests/
├── users.test.js         # Happy path: fetch users list
├── token-refresh.test.js # Token expiration & auto-refresh
├── role-access.test.js   # Role-based access control (admin vs user)
└── invalid-refresh.test.js # Error case: invalid refresh token
```

### Utility Modules

- **`utils/apiClient.js`** - APIClient class for making authenticated requests
  - Constructor: `new APIClient(request, parallelIndex)`
  - Methods: `get(endpoint, role)`, `ensureValidToken()`, `refreshToken()`
  - Mock methods: `mockTokenExpiration()`, `mockInvalidRefreshToken()`

- **`utils/auth.js`** - Authentication logic
  - `getAuthToken(request)` - Main function used in global setup
  - Handles login, token refresh, caching

- **`utils/logger.js`** - Centralized Winston logger
  - Respects `LOG_LEVEL` env var
  - Used throughout codebase for consistent logging

- **`utils/fixtures.js`** - Playwright test fixtures
  - `createTokenFixture()` - Cleans up token files before/after each test
  - Prevents state leakage between tests

## Key Conventions

### Error Handling

- **Critical failures throw errors** - Tests fail if auth fails
  - `ensureValidToken()` throws if no valid token can be obtained
  - `refreshToken()` throws with context on failure
  - `api.get()` wraps errors and logs them before rethrowing

- **Error messages include context** - Include endpoint, status code, response details
  - ❌ Bad: `"Authentication failed"`
  - ✅ Good: `"Login to http://localhost:8080/auth/login failed (status 401): invalid credentials"`

### Logging Levels

Use Winston logger with appropriate levels:

```javascript
logger.info('Starting operation')      // Normal flow
logger.debug('Token is still valid')   // Detailed debugging
logger.warn('Refresh failed, retrying') // Degraded but recoverable
logger.error('Cannot proceed')         // Critical failure
```

### Test Isolation

- Tests use `parallelIndex` to get worker-scoped token file
- Fixtures automatically delete token files before/after tests
- Each test starts with clean state, no token state leakage
- Safe for parallel execution (default) or sequential debugging

### ES Module Convention

All files use ES modules (`import`/`export`):

```javascript
import { APIClient } from '../utils/apiClient.js';  // Full extension required
export class MyClass { ... }
export { myFunction };
```

### Environment Variables

Configuration via `.env` file:

```
TEST_USERNAME=testuser           # Login credentials for test API
TEST_PASSWORD=testpass
API_BASE_URL=http://localhost:8080  # Mock server URL
LOG_LEVEL=info                   # Winston log level
```

## Common Patterns

### Making Authenticated Requests

```javascript
import { test } from '@playwright/test';
import { APIClient } from '../utils/apiClient.js';

test('example', async ({ request, parallelIndex }) => {
  const api = new APIClient(request, parallelIndex);
  
  // Auto-handles token refresh if expired
  const response = await api.get('/users', 'user');
  expect(response.status()).toBe(200);
});
```

### Testing Error Scenarios

```javascript
// Simulate expired token
await api.mockTokenExpiration();

// Simulate invalid refresh token
await api.mockInvalidRefreshToken();

// Next api.get() call will trigger refresh/error handling
```

### Debugging Failed Tests

1. **Check logs** - Look for `error:` messages from logger
2. **Run sequentially** - `npx playwright test -- --workers=1`
3. **View trace** - `npx playwright show-report` opens HTML report with traces
4. **Set LOG_LEVEL=debug** - Add to `.env` for verbose logging

## Important Notes

- **WireMock Mock Server** - Required for tests to run
  - Start with: `npm run start:wiremock`
  - Runs on `http://localhost:8080`
  - Responds to `/auth/login`, `/auth/refresh`, `/users`, `/admin-dashboard`

- **Global Setup** - Must run successfully before tests start
  - If it fails (e.g., WireMock not running), all tests will fail
  - Check logs: `logger.info()` outputs during setup

- **Parallel vs Sequential** - Default is parallel
  - Use `--workers=1` for debugging when state matters
  - Most tests are isolated and safe in parallel

- **Token Cleanup** - Automatic via fixtures
  - Don't manually delete `auth-token-worker-*.json` files
  - They're cleaned up after each test
  - Safe to commit `.gitignore` entries for these files

## MCP Servers

This project is configured to use the following MCP (Model Context Protocol) servers:

### GitHub MCP
- Access repository issues, PRs, commits, and metadata
- Requires `GITHUB_TOKEN` environment variable with `repo` scope
- Useful for: linking tests to issues, reviewing PR changes, tracking test results

### Filesystem MCP
- Enhanced file search and operations via ripgrep and glob
- Already integrated with Copilot for code search
- Useful for: finding test patterns, locating test data, refactoring across files

Configuration: See `.github/mcp-servers.json`
