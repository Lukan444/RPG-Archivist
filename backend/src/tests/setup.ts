// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';

// Mock Neo4j driver
jest.mock('neo4j-driver', () => {
  const mockSession = {
    run: jest.fn(),
    close: jest.fn(),
  };

  const mockDriver = {
    session: jest.fn(() => mockSession),
    close: jest.fn(),
  };

  return {
    driver: jest.fn(() => mockDriver),
    auth: {
      basic: jest.fn((username, password) => ({ username, password })),
    },
    types: {
      Node: jest.fn((identity, labels, properties) => ({
        identity,
        labels,
        properties,
      })),
      Relationship: jest.fn((identity, start, end, type, properties) => ({
        identity,
        start,
        end,
        type,
        properties,
      })),
      Path: jest.fn((start, segments) => ({
        start,
        segments,
      })),
    },
  };
});

// Global beforeAll and afterAll hooks
beforeAll(() => {
  // Set up any global test setup here
  console.log('Starting tests...');
});

afterAll(() => {
  // Clean up any global test resources here
  console.log('Tests completed.');
});

// Global beforeEach and afterEach hooks
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  // This is a good place to check for any leaked resources
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
