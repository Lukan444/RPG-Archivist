import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { v4 as uuidv4 } from 'uuid';

// These tests require a running Neo4j instance
// They are marked with 'integration' to be run separately from unit tests
describe('Database Integration', () => {
  let databaseService: DatabaseService;
  let repositoryFactory: RepositoryFactory;
  
  beforeAll(async () => {
    // Initialize database service
    databaseService = new DatabaseService();
    await databaseService.initialize();
    
    // Initialize repository factory
    repositoryFactory = new RepositoryFactory(databaseService);
    
    // Initialize schema
    await databaseService.initSchema();
  });
  
  afterAll(async () => {
    // Close database connection
    await databaseService.close();
  });
  
  describe('RPG World Repository', () => {
    it('should create and retrieve an RPG World', async () => {
      // Arrange
      const rpgWorldRepository = repositoryFactory.getRPGWorldRepository();
      const userId = uuidv4();
      const rpgWorldName = `Test RPG World ${Date.now()}`;
      
      // Act - Create RPG World
      const createdRPGWorld = await rpgWorldRepository.create({
        name: rpgWorldName,
        description: 'Test RPG World Description',
        system_version: '1.0'
      }, userId);
      
      // Act - Retrieve RPG World
      const retrievedRPGWorld = await rpgWorldRepository.findById(createdRPGWorld.rpg_world_id);
      
      // Assert
      expect(retrievedRPGWorld).not.toBeNull();
      expect(retrievedRPGWorld?.rpg_world_id).toBe(createdRPGWorld.rpg_world_id);
      expect(retrievedRPGWorld?.name).toBe(rpgWorldName);
      expect(retrievedRPGWorld?.description).toBe('Test RPG World Description');
      expect(retrievedRPGWorld?.system_version).toBe('1.0');
      expect(retrievedRPGWorld?.created_by).toBe(userId);
      
      // Cleanup
      await rpgWorldRepository.delete(createdRPGWorld.rpg_world_id);
    });
    
    it('should update an RPG World', async () => {
      // Arrange
      const rpgWorldRepository = repositoryFactory.getRPGWorldRepository();
      const userId = uuidv4();
      const rpgWorldName = `Test RPG World ${Date.now()}`;
      
      // Create RPG World
      const createdRPGWorld = await rpgWorldRepository.create({
        name: rpgWorldName,
        description: 'Test RPG World Description',
        system_version: '1.0'
      }, userId);
      
      // Act - Update RPG World
      const updatedRPGWorld = await rpgWorldRepository.update(createdRPGWorld.rpg_world_id, {
        description: 'Updated RPG World Description',
        system_version: '2.0'
      });
      
      // Act - Retrieve RPG World
      const retrievedRPGWorld = await rpgWorldRepository.findById(createdRPGWorld.rpg_world_id);
      
      // Assert
      expect(retrievedRPGWorld).not.toBeNull();
      expect(retrievedRPGWorld?.rpg_world_id).toBe(createdRPGWorld.rpg_world_id);
      expect(retrievedRPGWorld?.name).toBe(rpgWorldName);
      expect(retrievedRPGWorld?.description).toBe('Updated RPG World Description');
      expect(retrievedRPGWorld?.system_version).toBe('2.0');
      
      // Cleanup
      await rpgWorldRepository.delete(createdRPGWorld.rpg_world_id);
    });
    
    it('should delete an RPG World', async () => {
      // Arrange
      const rpgWorldRepository = repositoryFactory.getRPGWorldRepository();
      const userId = uuidv4();
      const rpgWorldName = `Test RPG World ${Date.now()}`;
      
      // Create RPG World
      const createdRPGWorld = await rpgWorldRepository.create({
        name: rpgWorldName,
        description: 'Test RPG World Description',
        system_version: '1.0'
      }, userId);
      
      // Act - Delete RPG World
      const deleted = await rpgWorldRepository.delete(createdRPGWorld.rpg_world_id);
      
      // Act - Retrieve RPG World
      const retrievedRPGWorld = await rpgWorldRepository.findById(createdRPGWorld.rpg_world_id);
      
      // Assert
      expect(deleted).toBe(true);
      expect(retrievedRPGWorld).toBeNull();
    });
  });
  
  describe('Campaign Repository', () => {
    it('should create and retrieve a Campaign', async () => {
      // Arrange
      const rpgWorldRepository = repositoryFactory.getRPGWorldRepository();
      const campaignRepository = repositoryFactory.getCampaignRepository();
      const userId = uuidv4();
      
      // Create RPG World
      const rpgWorld = await rpgWorldRepository.create({
        name: `Test RPG World ${Date.now()}`,
        description: 'Test RPG World Description',
        system_version: '1.0'
      }, userId);
      
      // Act - Create Campaign
      const campaignName = `Test Campaign ${Date.now()}`;
      const createdCampaign = await campaignRepository.create({
        rpg_world_id: rpgWorld.rpg_world_id,
        name: campaignName,
        description: 'Test Campaign Description',
        is_active: true
      }, userId);
      
      // Act - Retrieve Campaign
      const retrievedCampaign = await campaignRepository.findById(createdCampaign.campaign_id);
      
      // Assert
      expect(retrievedCampaign).not.toBeNull();
      expect(retrievedCampaign?.campaign_id).toBe(createdCampaign.campaign_id);
      expect(retrievedCampaign?.rpg_world_id).toBe(rpgWorld.rpg_world_id);
      expect(retrievedCampaign?.name).toBe(campaignName);
      expect(retrievedCampaign?.description).toBe('Test Campaign Description');
      expect(retrievedCampaign?.is_active).toBe(true);
      expect(retrievedCampaign?.created_by).toBe(userId);
      
      // Cleanup
      await campaignRepository.delete(createdCampaign.campaign_id);
      await rpgWorldRepository.delete(rpgWorld.rpg_world_id);
    });
  });
  
  describe('Transaction Management', () => {
    it('should rollback a transaction on error', async () => {
      // Arrange
      const rpgWorldRepository = repositoryFactory.getRPGWorldRepository();
      const userId = uuidv4();
      const rpgWorldName = `Test RPG World ${Date.now()}`;
      
      try {
        // Act - Execute a transaction that will fail
        await databaseService.writeTransaction(async (tx) => {
          // Create RPG World
          await tx.run(`
            CREATE (w:RPGWorld {
              rpg_world_id: $rpgWorldId,
              name: $name,
              description: $description,
              system_version: $systemVersion,
              created_at: $createdAt,
              created_by: $userId
            })
          `, {
            rpgWorldId: uuidv4(),
            name: rpgWorldName,
            description: 'Test RPG World Description',
            systemVersion: '1.0',
            createdAt: new Date().toISOString(),
            userId
          });
          
          // This will fail because we're trying to create a node with the same ID
          await tx.run(`
            CREATE (w:RPGWorld {
              rpg_world_id: $rpgWorldId,
              name: $name,
              description: $description,
              system_version: $systemVersion,
              created_at: $createdAt,
              created_by: $userId
            })
          `, {
            rpgWorldId: uuidv4(), // Different ID
            name: null, // This will fail if there's a NOT NULL constraint on name
            description: 'Another Test RPG World Description',
            systemVersion: '1.0',
            createdAt: new Date().toISOString(),
            userId
          });
        });
      } catch (error) {
        // Expected error
      }
      
      // Act - Try to find the RPG World
      const rpgWorlds = await rpgWorldRepository.findByName(rpgWorldName);
      
      // Assert - The RPG World should not exist because the transaction was rolled back
      expect(rpgWorlds).toBeNull();
    });
  });
});
