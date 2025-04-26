import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { RPGWorldRepository } from '../../repositories/rpg-world.repository';
import { Campaign, CampaignUserRelationshipType } from '../../models/campaign.model';
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

describe('Campaign Repository Integration', () => {
  let dbService: DatabaseService;
  let repositoryFactory: RepositoryFactory;
  let campaignRepository: CampaignRepository;
  let userRepository: UserRepository;
  let rpgWorldRepository: RPGWorldRepository;
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
    campaignRepository = repositoryFactory.getCampaignRepository();
    userRepository = repositoryFactory.getUserRepository();
    rpgWorldRepository = repositoryFactory.getRPGWorldRepository();

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await userRepository.create({
      username: `testuser-campaign-${Date.now()}`,
      email: `test-campaign-${Date.now()}@example.com`,
      password: hashedPassword,
      name: 'Test Campaign User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    testUser = user;
    testUserId = user.user_id;

    // Create a test RPG World
    const rpgWorld = await rpgWorldRepository.create({
      name: `Test RPG World ${Date.now()}`,
      description: 'Test RPG World Description',
      created_at: Date.now(),
      updated_at: Date.now()
    });
    testRPGWorld = rpgWorld;
    testRPGWorldId = rpgWorld.rpg_world_id;

    // Create test campaign data
    testCampaign = {
      name: `Test Campaign ${Date.now()}`,
      description: 'Test Campaign Description',
      rpg_world_id: testRPGWorldId,
      start_date: new Date().toISOString(),
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now()
    };
  });

  afterAll(async () => {
    if (skipTests) {
      return;
    }

    // Clean up test data
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

  describe('Campaign CRUD Operations', () => {
    it('should create a new campaign', async () => {
      if (skipTests) return;

      // Create campaign
      const createdCampaign = await campaignRepository.create(testCampaign);
      testCampaignId = createdCampaign.campaign_id;

      // Verify campaign was created
      expect(createdCampaign).toBeDefined();
      expect(createdCampaign.campaign_id).toBeDefined();
      expect(createdCampaign.name).toBe(testCampaign.name);
      expect(createdCampaign.description).toBe(testCampaign.description);
      expect(createdCampaign.rpg_world_id).toBe(testCampaign.rpg_world_id);
      expect(createdCampaign.is_active).toBe(testCampaign.is_active);
    });

    it('should get a campaign by ID', async () => {
      if (skipTests) return;

      // Get campaign by ID
      const campaign = await campaignRepository.findById(testCampaignId);

      // Verify campaign was retrieved
      expect(campaign).toBeDefined();
      expect(campaign.campaign_id).toBe(testCampaignId);
      expect(campaign.name).toBe(testCampaign.name);
      expect(campaign.description).toBe(testCampaign.description);
      expect(campaign.rpg_world_id).toBe(testCampaign.rpg_world_id);
      expect(campaign.is_active).toBe(testCampaign.is_active);
    });

    it('should get a campaign by name', async () => {
      if (skipTests) return;

      // Get campaign by name
      const campaign = await campaignRepository.findByName(testCampaign.name);

      // Verify campaign was retrieved
      expect(campaign).toBeDefined();
      expect(campaign.campaign_id).toBe(testCampaignId);
      expect(campaign.name).toBe(testCampaign.name);
      expect(campaign.description).toBe(testCampaign.description);
      expect(campaign.rpg_world_id).toBe(testCampaign.rpg_world_id);
      expect(campaign.is_active).toBe(testCampaign.is_active);
    });

    it('should find all campaigns', async () => {
      if (skipTests) return;

      // Find all campaigns
      const campaigns = await campaignRepository.findAll();

      // Verify campaigns were retrieved
      expect(campaigns).toBeDefined();
      expect(Array.isArray(campaigns)).toBe(true);
      
      // Find our test campaign in the results
      const testCampaignFound = campaigns.find(c => c.campaign_id === testCampaignId);
      expect(testCampaignFound).toBeDefined();
      expect(testCampaignFound.name).toBe(testCampaign.name);
    });

    it('should update a campaign', async () => {
      if (skipTests) return;

      // Update campaign
      const updatedCampaign = await campaignRepository.update(testCampaignId, {
        name: 'Updated Campaign Name',
        description: 'Updated Campaign Description',
        is_active: false
      });

      // Verify campaign was updated
      expect(updatedCampaign).toBeDefined();
      expect(updatedCampaign.campaign_id).toBe(testCampaignId);
      expect(updatedCampaign.name).toBe('Updated Campaign Name');
      expect(updatedCampaign.description).toBe('Updated Campaign Description');
      expect(updatedCampaign.rpg_world_id).toBe(testCampaign.rpg_world_id);
      expect(updatedCampaign.is_active).toBe(false);
    });
  });

  describe('Campaign User Relationships', () => {
    it('should add a user to a campaign', async () => {
      if (skipTests) return;

      // Add user to campaign
      await campaignRepository.addUser(testCampaignId, testUserId, CampaignUserRelationshipType.OWNER);

      // Verify user was added
      const users = await campaignRepository.getUsers(testCampaignId);
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      // Find our test user in the results
      const testUserRelationship = users.find(u => u.user.user_id === testUserId);
      expect(testUserRelationship).toBeDefined();
      expect(testUserRelationship.user.username).toBe(testUser.username);
      expect(testUserRelationship.relationship_type).toBe(CampaignUserRelationshipType.OWNER);
    });

    it('should check if a user is an owner of a campaign', async () => {
      if (skipTests) return;

      // Check if user is an owner
      const isOwner = await campaignRepository.isOwner(testCampaignId, testUserId);

      // Verify user is an owner
      expect(isOwner).toBe(true);
    });

    it('should check if a user is a participant in a campaign', async () => {
      if (skipTests) return;

      // Check if user is a participant
      const isParticipant = await campaignRepository.isParticipant(testCampaignId, testUserId);

      // Verify user is a participant
      expect(isParticipant).toBe(true);
    });

    it('should remove a user from a campaign', async () => {
      if (skipTests) return;

      // Remove user from campaign
      await campaignRepository.removeUser(testCampaignId, testUserId);

      // Verify user was removed
      const users = await campaignRepository.getUsers(testCampaignId);
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);

      // Our test user should not be in the results
      const testUserRelationship = users.find(u => u.user.user_id === testUserId);
      expect(testUserRelationship).toBeUndefined();
    });
  });

  describe('Campaign Deletion', () => {
    it('should delete a campaign', async () => {
      if (skipTests) return;

      // Delete campaign
      const deleted = await campaignRepository.delete(testCampaignId);

      // Verify campaign was deleted
      expect(deleted).toBe(true);

      // Try to get the deleted campaign
      const campaign = await campaignRepository.findById(testCampaignId);
      expect(campaign).toBeNull();

      // Clear testCampaignId since the campaign has been deleted
      testCampaignId = null;
    });
  });
});
