import fs from 'fs';
import path from 'path';
import logger from './logger.js';

export function createTokenFixture() {
  return async (use, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    const tokenFile = path.join(process.cwd(), `auth-token-worker-${workerIndex}.json`);
    
    // Clean up before test (delete stale token to force fresh auth)
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
      logger.debug(`Deleted stale token file: ${tokenFile}`);
    }

    // Run the test
    await use();

    // Clean up after test
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
      logger.debug(`Cleaned up token file after test: ${tokenFile}`);
    }
  };
}
