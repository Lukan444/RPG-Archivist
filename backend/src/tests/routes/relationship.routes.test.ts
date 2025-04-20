import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { RelationshipRepository } from '../../repositories/relationship.repository';
import { CharacterRepository } from '../../repositories/character.repository';
import { LocationRepository } from '../../repositories/location.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { EntityType } from '../../models/relationship.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/relationship.repository');
jest.mock('../../repositories/character.repository');
jest.mock('../../repositories/location.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/user.repository');

describe('Relationship Routes', () => {
  let mockRelationshipRepository: jest.Mocked<RelationshipRepository>;
  let mockCharacterRepository: jest.Mocked<CharacterRepository>;
  let mockLocationRepository: jest.Mocked<LocationRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockRelationshipRepository = new RelationshipRepository(null as any) as jest.Mocked<RelationshipRepository>;
    mockCharacterRepository = new CharacterRepository(null as any) as jest.Mocked<CharacterRepository>;
    mockLocationRepository = new LocationRepository(null as any) as jest.Mocked<LocationRepository>;
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getRelationshipRepository: jest.fn().mockReturnValue(mockRelationshipRepository),
      getCharacterRepository: jest.fn().mockReturnValue(mockCharacterRepository),
      getLocationRepository: jest.fn().mockReturnValue(mockLocationRepository),
      getCampaignRepository: jest.fn().mockReturnValue(mockCampaignRepository),
      getUserRepository: jest.fn().mockReturnValue(mockUserRepository)
    };

    // Create tokens
    const adminId = uuidv4();
    const userId = uuidv4();
    
    adminToken = generateToken({
      user_id: adminId,
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.ADMIN
    });
    
    userToken = generateToken({
      user_id: userId,
      username: 'user',
      email: 'user@example.com',
      role: UserRole.PLAYER
    });

    // Mock user repository methods
    mockUserRepository.findById.mockImplementation(async (id) => {
      if (id === adminId) {
        return {
          user_id: adminId,
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          password_hash: 'hash',
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true
        };
      } else if (id === userId) {
        return {
          user_id: userId,
          username: 'user',
          email: 'user@example.com',
          role: UserRole.PLAYER,
          password_hash: 'hash',
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true
        };
      }
      return null;
    });
  });

  describe('GET /api/v1/relationships', () => {
    it('should return all relationships', async () => {
      // Create test data
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const locationId = uuidv4();

      // Mock repository methods
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockRelationshipRepository.findAll.mockResolvedValue({
        relationships: [
          {
            relationship_id: uuidv4(),
            campaign_id: campaignId,
            source_entity_id: characterId1,
            source_entity_type: EntityType.CHARACTER,
            target_entity_id: characterId2,
            target_entity_type: EntityType.CHARACTER,
            relationship_type: 'friend',
            description: 'They are friends',
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            relationship_id: uuidv4(),
            campaign_id: campaignId,
            source_entity_id: characterId1,
            source_entity_type: EntityType.CHARACTER,
            target_entity_id: locationId,
            target_entity_type: EntityType.LOCATION,
            relationship_type: 'lives_at',
            description: 'Character lives at this location',
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get(/api/v1/relationships?campaign_id=)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].relationship_type).toBe('friend');
      expect(response.body.data[1].relationship_type).toBe('lives_at');
    });

    it('should return 400 if campaign_id is not provided', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/relationships')
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_ID_REQUIRED');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();

      // Mock repository method
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/relationships?campaign_id=)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/relationships/:id', () => {
    it('should return relationship by ID', async () => {
      // Create test data
      const relationshipId = uuidv4();
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRelationshipRepository.findById.mockResolvedValue(relationship);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .get(/api/v1/relationships/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        relationship_id: relationshipId,
        relationship_type: 'friend',
        description: 'They are friends'
      }));
    });

    it('should return 404 if relationship not found', async () => {
      // Mock repository method
      mockRelationshipRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/relationships/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RELATIONSHIP_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const relationshipId = uuidv4();
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRelationshipRepository.findById.mockResolvedValue(relationship);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/relationships/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/relationships', () => {
    it('should create a new relationship', async () => {
      // Create test data
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationshipId = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue({
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      });
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCharacterRepository.findById.mockImplementation(async (id) => {
        if (id === characterId1 || id === characterId2) {
          return {
            character_id: id,
            campaign_id: campaignId,
            name: Character ,
            description: 'Test Character Description',
            is_player_character: false,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          };
        }
        return null;
      });
      mockRelationshipRepository.create.mockResolvedValue(relationship);

      // Make request
      const response = await request(app)
        .post('/api/v1/relationships')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          source_entity_id: characterId1,
          source_entity_type: EntityType.CHARACTER,
          target_entity_id: characterId2,
          target_entity_type: EntityType.CHARACTER,
          relationship_type: 'friend',
          description: 'They are friends'
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        target_entity_id: characterId2,
        relationship_type: 'friend',
        description: 'They are friends'
      }));
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/relationships')
        .set('Authorization', Bearer )
        .send({
          campaign_id: uuidv4(),
          source_entity_id: uuidv4(),
          source_entity_type: EntityType.CHARACTER,
          target_entity_id: uuidv4(),
          target_entity_type: EntityType.CHARACTER,
          relationship_type: 'friend',
          description: 'They are friends'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue({
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      });
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .post('/api/v1/relationships')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          source_entity_id: uuidv4(),
          source_entity_type: EntityType.CHARACTER,
          target_entity_id: uuidv4(),
          target_entity_type: EntityType.CHARACTER,
          relationship_type: 'friend',
          description: 'They are friends'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 if source entity not found', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sourceEntityId = uuidv4();
      const targetEntityId = uuidv4();

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue({
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      });
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCharacterRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/relationships')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          source_entity_id: sourceEntityId,
          source_entity_type: EntityType.CHARACTER,
          target_entity_id: targetEntityId,
          target_entity_type: EntityType.CHARACTER,
          relationship_type: 'friend',
          description: 'They are friends'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SOURCE_ENTITY_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/relationships/:id', () => {
    it('should update relationship', async () => {
      // Create test data
      const relationshipId = uuidv4();
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };
      const updatedRelationship = {
        ...relationship,
        relationship_type: 'best_friend',
        description: 'They are best friends'
      };

      // Mock repository methods
      mockRelationshipRepository.findById.mockResolvedValue(relationship);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockRelationshipRepository.update.mockResolvedValue(updatedRelationship);

      // Make request
      const response = await request(app)
        .put(/api/v1/relationships/)
        .set('Authorization', Bearer )
        .send({
          relationship_type: 'best_friend',
          description: 'They are best friends'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        relationship_id: relationshipId,
        relationship_type: 'best_friend',
        description: 'They are best friends'
      }));
    });

    it('should return 404 if relationship not found', async () => {
      // Mock repository method
      mockRelationshipRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put(/api/v1/relationships/)
        .set('Authorization', Bearer )
        .send({
          relationship_type: 'best_friend',
          description: 'They are best friends'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RELATIONSHIP_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const relationshipId = uuidv4();
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRelationshipRepository.findById.mockResolvedValue(relationship);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .put(/api/v1/relationships/)
        .set('Authorization', Bearer )
        .send({
          relationship_type: 'best_friend',
          description: 'They are best friends'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/relationships/:id', () => {
    it('should delete relationship', async () => {
      // Create test data
      const relationshipId = uuidv4();
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRelationshipRepository.findById.mockResolvedValue(relationship);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockRelationshipRepository.delete.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .delete(/api/v1/relationships/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
    });

    it('should return 404 if relationship not found', async () => {
      // Mock repository method
      mockRelationshipRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .delete(/api/v1/relationships/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RELATIONSHIP_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const relationshipId = uuidv4();
      const campaignId = uuidv4();
      const characterId1 = uuidv4();
      const characterId2 = uuidv4();
      const relationship = {
        relationship_id: relationshipId,
        campaign_id: campaignId,
        source_entity_id: characterId1,
        source_entity_type: EntityType.CHARACTER,
        target_entity_id: characterId2,
        target_entity_type: EntityType.CHARACTER,
        relationship_type: 'friend',
        description: 'They are friends',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRelationshipRepository.findById.mockResolvedValue(relationship);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .delete(/api/v1/relationships/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
