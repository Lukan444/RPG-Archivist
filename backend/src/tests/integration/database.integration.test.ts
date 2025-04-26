import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import neo4j from 'neo4j-driver';

// This test requires a running Neo4j database
// It will be skipped if the environment variable SKIP_INTEGRATION_TESTS is set to 'true'
const skipTests = process.env.SKIP_INTEGRATION_TESTS === 'true';

// Use a separate database for testing
const testDbConfig = {
  uri: process.env.TEST_NEO4J_URI || 'bolt://localhost:7687',
  username: process.env.TEST_NEO4J_USERNAME || 'neo4j',
  password: process.env.TEST_NEO4J_PASSWORD || 'password',
};

// Mock config to use test database
jest.mock('../../config', () => ({
  neo4j: {
    uri: testDbConfig.uri,
    username: testDbConfig.username,
    password: testDbConfig.password,
  },
}));

describe('Database Integration', () => {
  let dbService: DatabaseService;
  let repositoryFactory: RepositoryFactory;

  beforeAll(async () => {
    if (skipTests) {
      return;
    }

    // Initialize database service
    dbService = new DatabaseService();
    await dbService.initialize();

    // Initialize repository factory
    repositoryFactory = new RepositoryFactory(dbService);
  });

  afterAll(async () => {
    if (skipTests) {
      return;
    }

    // Close database connection
    await dbService.close();
  });

  // Skip all tests if SKIP_INTEGRATION_TESTS is true
  beforeEach(() => {
    if (skipTests) {
      console.log('Skipping integration tests');
      return;
    }
  });

  describe('DatabaseService', () => {
    it('should connect to the database', async () => {
      if (skipTests) return;

      // Test connection by running a simple query
      const session = dbService.getSession();
      const result = await session.run('RETURN 1 as n');
      session.close();

      // Verify that the query returned the expected result
      expect(result.records[0].get('n').toNumber()).toBe(1);
    });

    it('should execute a read transaction', async () => {
      if (skipTests) return;

      // Execute a read transaction
      const result = await dbService.readTransaction(async (tx) => {
        const result = await tx.run('RETURN 1 as n');
        return result.records[0].get('n').toNumber();
      });

      // Verify that the transaction returned the expected result
      expect(result).toBe(1);
    });

    it('should execute a write transaction', async () => {
      if (skipTests) return;

      // Create a test node
      const testId = `test-${Date.now()}`;
      await dbService.writeTransaction(async (tx) => {
        await tx.run('CREATE (n:TestNode {id: $id}) RETURN n', { id: testId });
      });

      // Verify that the node was created
      const result = await dbService.readTransaction(async (tx) => {
        const result = await tx.run('MATCH (n:TestNode {id: $id}) RETURN n', { id: testId });
        return result.records.length;
      });

      // Clean up
      await dbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (n:TestNode {id: $id}) DELETE n', { id: testId });
      });

      // Verify that the node was found
      expect(result).toBe(1);
    });
  });

  describe('RepositoryFactory', () => {
    it('should create repositories', () => {
      if (skipTests) return;

      // Get repositories
      const userRepository = repositoryFactory.getUserRepository();
      const rpgWorldRepository = repositoryFactory.getRPGWorldRepository();
      const campaignRepository = repositoryFactory.getCampaignRepository();

      // Verify that repositories were created
      expect(userRepository).toBeDefined();
      expect(rpgWorldRepository).toBeDefined();
      expect(campaignRepository).toBeDefined();
    });

    it('should cache repositories', () => {
      if (skipTests) return;

      // Get repositories twice
      const userRepository1 = repositoryFactory.getUserRepository();
      const userRepository2 = repositoryFactory.getUserRepository();

      // Verify that the same repository instance was returned
      expect(userRepository1).toBe(userRepository2);
    });
  });
});
