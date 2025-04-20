import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { CharacterRepository } from '../../repositories/character.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/character.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/user.repository');

describe('Character Routes', () => {
  let mockCharacterRepository: jest.Mocked<CharacterRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockCharacterRepository = new CharacterRepository(null as any) as jest.Mocked<CharacterRepository>;
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getCharacterRepository: jest.fn().mockReturnValue(mockCharacterRepository),
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

  describe('GET /api/v1/characters', () => {
    it('should return all characters', async () => {
      // Mock repository method
      mockCharacterRepository.findAll.mockResolvedValue({
        characters: [
          {
            character_id: uuidv4(),
            campaign_id: uuidv4(),
            name: 'Test Character 1',
            description: 'Test Character 1 Description',
            is_player_character: true,
            player_id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            character_id: uuidv4(),
            campaign_id: uuidv4(),
            name: 'Test Character 2',
            description: 'Test Character 2 Description',
            is_player_character: false,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get('/api/v1/characters')
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Test Character 1');
      expect(response.body.data[1].name).toBe('Test Character 2');
    });

    it('should return 401 if not authenticated', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/characters');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/characters/:id', () => {
    it('should return character by ID', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .get(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        character_id: characterId,
        name: 'Test Character',
        description: 'Test Character Description'
      }));
    });

    it('should return 404 if character not found', async () => {
      // Mock repository method
      mockCharacterRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHARACTER_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/characters', () => {
    it('should create a new character', async () => {
      // Create test data
      const campaignId = uuidv4();
      const characterId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
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
      mockCharacterRepository.create.mockResolvedValue(character);

      // Make request
      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Character',
          description: 'Test Character Description',
          is_player_character: false
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description'
      }));
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', Bearer )
        .send({
          campaign_id: uuidv4(),
          name: 'Test Character',
          description: 'Test Character Description',
          is_player_character: false
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
        .post('/api/v1/characters')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Character',
          description: 'Test Character Description',
          is_player_character: false
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PUT /api/v1/characters/:id', () => {
    it('should update character', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };
      const updatedCharacter = {
        ...character,
        name: 'Updated Character',
        description: 'Updated Description'
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCharacterRepository.update.mockResolvedValue(updatedCharacter);

      // Make request
      const response = await request(app)
        .put(/api/v1/characters/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Character',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        character_id: characterId,
        name: 'Updated Character',
        description: 'Updated Description'
      }));
    });

    it('should return 404 if character not found', async () => {
      // Mock repository method
      mockCharacterRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put(/api/v1/characters/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Character',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHARACTER_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .put(/api/v1/characters/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Character',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/characters/:id', () => {
    it('should delete character', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCharacterRepository.delete.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .delete(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
    });

    it('should return 404 if character not found', async () => {
      // Mock repository method
      mockCharacterRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .delete(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHARACTER_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .delete(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 if character has relationships', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCharacterRepository.delete.mockImplementation(() => {
        throw new Error('Cannot delete character with associated relationships');
      });

      // Make request
      const response = await request(app)
        .delete(/api/v1/characters/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHARACTER_HAS_RELATIONSHIPS');
    });
  });

  describe('GET /api/v1/characters/:id/relationships', () => {
    it('should return character relationships', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };
      const relationships = [
        {
          relationship_id: uuidv4(),
          source_character_id: characterId,
          target_character_id: uuidv4(),
          relationship_type: 'friend',
          description: 'Friend relationship',
          created_at: new Date().toISOString()
        },
        {
          relationship_id: uuidv4(),
          source_character_id: characterId,
          target_character_id: uuidv4(),
          relationship_type: 'enemy',
          description: 'Enemy relationship',
          created_at: new Date().toISOString()
        }
      ];

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCharacterRepository.getRelationships.mockResolvedValue(relationships);

      // Make request
      const response = await request(app)
        .get(/api/v1/characters//relationships)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].relationship_type).toBe('friend');
      expect(response.body.data[1].relationship_type).toBe('enemy');
    });

    it('should return 404 if character not found', async () => {
      // Mock repository method
      mockCharacterRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/characters//relationships)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHARACTER_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const characterId = uuidv4();
      const campaignId = uuidv4();
      const character = {
        character_id: characterId,
        campaign_id: campaignId,
        name: 'Test Character',
        description: 'Test Character Description',
        is_player_character: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCharacterRepository.findById.mockResolvedValue(character);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/characters//relationships)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
