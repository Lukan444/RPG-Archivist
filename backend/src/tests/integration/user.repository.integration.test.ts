import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserRole } from '../../models/user.model';
import bcrypt from 'bcrypt';

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

describe('User Repository Integration', () => {
  let dbService: DatabaseService;
  let repositoryFactory: RepositoryFactory;
  let userRepository: UserRepository;
  let testUser: User;
  let testUserId: string;

  beforeAll(async () => {
    if (skipTests) {
      return;
    }

    // Initialize database service
    dbService = new DatabaseService();
    await dbService.initialize();

    // Initialize repository factory
    repositoryFactory = new RepositoryFactory(dbService);

    // Get user repository
    userRepository = repositoryFactory.getUserRepository();

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = {
      username: `testuser-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      password: hashedPassword,
      name: 'Test User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now()
    };
  });

  afterAll(async () => {
    if (skipTests) {
      return;
    }

    // Clean up test user if it exists
    if (testUserId) {
      await dbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (u:User {user_id: $id}) DETACH DELETE u', { id: testUserId });
      });
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

  describe('User CRUD Operations', () => {
    it('should create a new user', async () => {
      if (skipTests) return;

      // Create user
      const createdUser = await userRepository.create(testUser);
      testUserId = createdUser.user_id;

      // Verify user was created
      expect(createdUser).toBeDefined();
      expect(createdUser.user_id).toBeDefined();
      expect(createdUser.username).toBe(testUser.username);
      expect(createdUser.email).toBe(testUser.email);
      expect(createdUser.name).toBe(testUser.name);
      expect(createdUser.role).toBe(testUser.role);
      
      // Password should be hashed
      expect(createdUser.password).toBe(testUser.password);
    });

    it('should get a user by ID', async () => {
      if (skipTests) return;

      // Get user by ID
      const user = await userRepository.getById(testUserId);

      // Verify user was retrieved
      expect(user).toBeDefined();
      expect(user.user_id).toBe(testUserId);
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(user.role).toBe(testUser.role);
    });

    it('should get a user by username', async () => {
      if (skipTests) return;

      // Get user by username
      const user = await userRepository.getByUsername(testUser.username);

      // Verify user was retrieved
      expect(user).toBeDefined();
      expect(user.user_id).toBe(testUserId);
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(user.role).toBe(testUser.role);
    });

    it('should get a user by email', async () => {
      if (skipTests) return;

      // Get user by email
      const user = await userRepository.getByEmail(testUser.email);

      // Verify user was retrieved
      expect(user).toBeDefined();
      expect(user.user_id).toBe(testUserId);
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(user.role).toBe(testUser.role);
    });

    it('should update a user', async () => {
      if (skipTests) return;

      // Update user
      const updatedUser = await userRepository.update(testUserId, {
        name: 'Updated Test User',
        role: UserRole.GAME_MASTER
      });

      // Verify user was updated
      expect(updatedUser).toBeDefined();
      expect(updatedUser.user_id).toBe(testUserId);
      expect(updatedUser.username).toBe(testUser.username);
      expect(updatedUser.email).toBe(testUser.email);
      expect(updatedUser.name).toBe('Updated Test User');
      expect(updatedUser.role).toBe(UserRole.GAME_MASTER);
    });

    it('should delete a user', async () => {
      if (skipTests) return;

      // Delete user
      const deleted = await userRepository.delete(testUserId);

      // Verify user was deleted
      expect(deleted).toBe(true);

      // Try to get the deleted user
      const user = await userRepository.getById(testUserId);
      expect(user).toBeNull();

      // Clear testUserId since the user has been deleted
      testUserId = null;
    });
  });

  describe('User Validation', () => {
    it('should not create a user with duplicate username', async () => {
      if (skipTests) return;

      // Create a user
      const user1 = await userRepository.create({
        ...testUser,
        username: `duplicate-${Date.now()}`,
        email: `duplicate1-${Date.now()}@example.com`
      });
      
      // Store the ID for cleanup
      testUserId = user1.user_id;

      // Try to create another user with the same username
      try {
        await userRepository.create({
          ...testUser,
          username: user1.username,
          email: `duplicate2-${Date.now()}@example.com`
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify error was thrown
        expect(error).toBeDefined();
        expect(error.message).toContain('already exists');
      }
    });

    it('should not create a user with duplicate email', async () => {
      if (skipTests) return;

      // Create a user
      const user1 = await userRepository.create({
        ...testUser,
        username: `duplicate-email-${Date.now()}`,
        email: `duplicate-email-${Date.now()}@example.com`
      });
      
      // Update testUserId for cleanup
      testUserId = user1.user_id;

      // Try to create another user with the same email
      try {
        await userRepository.create({
          ...testUser,
          username: `duplicate-email2-${Date.now()}`,
          email: user1.email
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify error was thrown
        expect(error).toBeDefined();
        expect(error.message).toContain('already exists');
      }
    });
  });

  describe('User Password Management', () => {
    it('should verify a correct password', async () => {
      if (skipTests) return;

      // Create a user with a known password
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const user = await userRepository.create({
        ...testUser,
        username: `password-test-${Date.now()}`,
        email: `password-test-${Date.now()}@example.com`,
        password: hashedPassword
      });
      
      // Update testUserId for cleanup
      testUserId = user.user_id;

      // Verify password
      const isValid = await bcrypt.compare(plainPassword, user.password);
      expect(isValid).toBe(true);
    });

    it('should not verify an incorrect password', async () => {
      if (skipTests) return;

      // Create a user with a known password
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const user = await userRepository.create({
        ...testUser,
        username: `password-test2-${Date.now()}`,
        email: `password-test2-${Date.now()}@example.com`,
        password: hashedPassword
      });
      
      // Update testUserId for cleanup
      testUserId = user.user_id;

      // Verify password
      const isValid = await bcrypt.compare('wrongpassword', user.password);
      expect(isValid).toBe(false);
    });
  });
});
