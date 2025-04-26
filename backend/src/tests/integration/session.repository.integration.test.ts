import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { SessionRepository } from '../../repositories/session.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { RPGWorldRepository } from '../../repositories/rpg-world.repository';
import { Session } from '../../models/session.model';
import { Campaign } from '../../models/campaign.model';
import { User, UserRole } from '../../models/user.model';
import { RPGWorld } from '../../models/rpg-world.model';
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

describe('Session Repository Integration', () => {
  let dbService: DatabaseService;
  let repositoryFactory: RepositoryFactory;
  let sessionRepository: SessionRepository;
  let campaignRepository: CampaignRepository;
  let userRepository: UserRepository;
  let rpgWorldRepository: RPGWorldRepository;
  let testSession: Session;
  let testSessionId: string;
  let testCampaign: Campaign;
  let testCampaignId: string;
  let testUser: User;
  let testUserId: string;
  let testRPGWorld: RPGWorld;
  let testRPGWorldId: string;

  beforeAll(async () => {
    if (skipTests) {
      return;
    }

    // Initialize database service
    dbService = new DatabaseService();
    await dbService.initialize();

    // Initialize repository factory
    repositoryFactory = new RepositoryFactory(dbService);

    // Get repositories
    sessionRepository = repositoryFactory.getSessionRepository();
    campaignRepository = repositoryFactory.getCampaignRepository();
    userRepository = repositoryFactory.getUserRepository();
    rpgWorldRepository = repositoryFactory.getRPGWorldRepository();

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await userRepository.create({
      username: `testuser-session-${Date.now()}`,
      email: `test-session-${Date.now()}@example.com`,
      password: hashedPassword,
      name: 'Test Session User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    testUser = user;
    testUserId = user.user_id;

    // Create a test RPG World
    const rpgWorld = await rpgWorldRepository.create({
      name: `Test RPG World Session ${Date.now()}`,
      description: 'Test RPG World Description for Session',
      created_at: Date.now(),
      updated_at: Date.now()
    });
    testRPGWorld = rpgWorld;
    testRPGWorldId = rpgWorld.rpg_world_id;

    // Create a test campaign
    const campaign = await campaignRepository.create({
      name: `Test Campaign Session ${Date.now()}`,
      description: 'Test Campaign Description for Session',
      rpg_world_id: testRPGWorldId,
      start_date: new Date().toISOString(),
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    testCampaign = campaign;
    testCampaignId = campaign.campaign_id;

    // Create test session data
    testSession = {
      campaign_id: testCampaignId,
      name: `Test Session ${Date.now()}`,
      description: 'Test Session Description',
      number: 1,
      date: new Date().toISOString(),
      duration_minutes: 180,
      is_completed: false,
      created_at: Date.now(),
      updated_at: Date.now()
    };
  });

  afterAll(async () => {
    if (skipTests) {
      return;
    }

    // Clean up test data
    if (testSessionId) {
      await dbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (s:Session {session_id: $id}) DETACH DELETE s', { id: testSessionId });
      });
    }

    if (testCampaignId) {
      await dbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (c:Campaign {campaign_id: $id}) DETACH DELETE c', { id: testCampaignId });
      });
    }

    if (testUserId) {
      await dbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (u:User {user_id: $id}) DETACH DELETE u', { id: testUserId });
      });
    }

    if (testRPGWorldId) {
      await dbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (w:RPGWorld {rpg_world_id: $id}) DETACH DELETE w', { id: testRPGWorldId });
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

  describe('Session CRUD Operations', () => {
    it('should create a new session', async () => {
      if (skipTests) return;

      // Create session
      const createdSession = await sessionRepository.create(testSession);
      testSessionId = createdSession.session_id;

      // Verify session was created
      expect(createdSession).toBeDefined();
      expect(createdSession.session_id).toBeDefined();
      expect(createdSession.campaign_id).toBe(testSession.campaign_id);
      expect(createdSession.name).toBe(testSession.name);
      expect(createdSession.description).toBe(testSession.description);
      expect(createdSession.number).toBe(testSession.number);
      expect(createdSession.is_completed).toBe(testSession.is_completed);
    });

    it('should get a session by ID', async () => {
      if (skipTests) return;

      // Get session by ID
      const session = await sessionRepository.findById(testSessionId);

      // Verify session was retrieved
      expect(session).toBeDefined();
      expect(session.session_id).toBe(testSessionId);
      expect(session.campaign_id).toBe(testSession.campaign_id);
      expect(session.name).toBe(testSession.name);
      expect(session.description).toBe(testSession.description);
      expect(session.number).toBe(testSession.number);
      expect(session.is_completed).toBe(testSession.is_completed);
    });

    it('should find all sessions', async () => {
      if (skipTests) return;

      // Find all sessions
      const sessions = await sessionRepository.findAll();

      // Verify sessions were retrieved
      expect(sessions).toBeDefined();
      expect(Array.isArray(sessions)).toBe(true);
      
      // Find our test session in the results
      const testSessionFound = sessions.find(s => s.session_id === testSessionId);
      expect(testSessionFound).toBeDefined();
      expect(testSessionFound.name).toBe(testSession.name);
    });

    it('should find sessions by campaign ID', async () => {
      if (skipTests) return;

      // Find sessions by campaign ID
      const sessions = await sessionRepository.findAll({ campaign_id: testCampaignId });

      // Verify sessions were retrieved
      expect(sessions).toBeDefined();
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      
      // All sessions should belong to the test campaign
      sessions.forEach(session => {
        expect(session.campaign_id).toBe(testCampaignId);
      });
      
      // Find our test session in the results
      const testSessionFound = sessions.find(s => s.session_id === testSessionId);
      expect(testSessionFound).toBeDefined();
      expect(testSessionFound.name).toBe(testSession.name);
    });

    it('should update a session', async () => {
      if (skipTests) return;

      // Update session
      const updatedSession = await sessionRepository.update(testSessionId, {
        name: 'Updated Session Name',
        description: 'Updated Session Description',
        is_completed: true
      });

      // Verify session was updated
      expect(updatedSession).toBeDefined();
      expect(updatedSession.session_id).toBe(testSessionId);
      expect(updatedSession.campaign_id).toBe(testSession.campaign_id);
      expect(updatedSession.name).toBe('Updated Session Name');
      expect(updatedSession.description).toBe('Updated Session Description');
      expect(updatedSession.number).toBe(testSession.number);
      expect(updatedSession.is_completed).toBe(true);
    });

    it('should delete a session', async () => {
      if (skipTests) return;

      // Delete session
      const deleted = await sessionRepository.delete(testSessionId);

      // Verify session was deleted
      expect(deleted).toBe(true);

      // Try to get the deleted session
      const session = await sessionRepository.findById(testSessionId);
      expect(session).toBeNull();

      // Clear testSessionId since the session has been deleted
      testSessionId = null;
    });
  });

  describe('Session Validation', () => {
    it('should not create a session with invalid campaign ID', async () => {
      if (skipTests) return;

      // Try to create a session with an invalid campaign ID
      try {
        await sessionRepository.create({
          ...testSession,
          campaign_id: 'invalid-campaign-id'
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify error was thrown
        expect(error).toBeDefined();
      }
    });

    it('should create a session with a valid campaign ID', async () => {
      if (skipTests) return;

      // Create a session with a valid campaign ID
      const session = await sessionRepository.create({
        ...testSession,
        name: `Valid Campaign Session ${Date.now()}`
      });
      
      // Store the ID for cleanup
      testSessionId = session.session_id;

      // Verify session was created
      expect(session).toBeDefined();
      expect(session.session_id).toBeDefined();
      expect(session.campaign_id).toBe(testCampaignId);
    });
  });

  describe('Session Relationships', () => {
    it('should retrieve the campaign for a session', async () => {
      if (skipTests) return;

      // Get the session with its campaign
      const session = await sessionRepository.findById(testSessionId);
      
      // Verify session was retrieved
      expect(session).toBeDefined();
      expect(session.campaign_id).toBe(testCampaignId);
      
      // Get the campaign for the session
      const campaign = await campaignRepository.findById(session.campaign_id);
      
      // Verify campaign was retrieved
      expect(campaign).toBeDefined();
      expect(campaign.campaign_id).toBe(testCampaignId);
      expect(campaign.name).toBe(testCampaign.name);
    });
  });
});
