// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railway-planner-test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Increase timeout for tests
jest.setTimeout(30000);

// Only mock console methods in CI environment to see logs during local test debugging
if (process.env.CI === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
