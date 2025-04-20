import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { RPGWorldRepository } from '../../repositories/rpg-world.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { CampaignUserRelationshipType } from '../../models/campaign.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/rpg-world.repository');
jest.mock('../../repositories/user.repository');

describe('Campaign Routes', () => {
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockRPGWorldRepository: jest.Mocked<RPGWorldRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockRPGWorldRepository = new RPGWorldRepository(null as any) as jest.Mocked<RPGWorldRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getCampaignRepository: jest.fn().mockReturnValue(mockCampaignRepository),
      getRPGWorldRepository: jest.fn().mockReturnValue(mockRPGWorldRepository),
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

  describe('GET /api/v1/campaigns', () => {
    it('should return all campaigns', async () => {
      // Mock repository method
      mockCampaignRepository.findAll.mockResolvedValue({
        campaigns: [
          {
            campaign_id: uuidv4(),
            name: 'Test Campaign 1',
            description: 'Test Campaign 1 Description',
            rpg_world_id: uuidv4(),
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            campaign_id: uuidv4(),
            name: 'Test Campaign 2',
            description: 'Test Campaign 2 Description',
            rpg_world_id: uuidv4(),
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get('/api/v1/campaigns')
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Test Campaign 1');
      expect(response.body.data[1].name).toBe('Test Campaign 2');
    });

    it('should return 401 if not authenticated', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/campaigns');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/campaigns/:id', () => {
    it('should return campaign by ID', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(campaign);

      // Make request
      const response = await request(app)
        .get(/api/v1/campaigns/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description'
      }));
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/campaigns/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });
  });

  describe('POST /api/v1/campaigns', () => {
    it('should create a new campaign', async () => {
      // Create test data
      const rpgWorldId = uuidv4();
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: rpgWorldId,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRPGWorldRepository.findById.mockResolvedValue({
        rpg_world_id: rpgWorldId,
        name: 'Test RPG World',
        description: 'Test RPG World Description',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      });
      mockCampaignRepository.findByName.mockResolvedValue(null);
      mockCampaignRepository.create.mockResolvedValue(campaign);

      // Make request
      const response = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', Bearer )
        .send({
          name: 'Test Campaign',
          description: 'Test Campaign Description',
          rpg_world_id: rpgWorldId
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: rpgWorldId
      }));
    });

    it('should return 404 if RPG World not found', async () => {
      // Mock repository method
      mockRPGWorldRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', Bearer )
        .send({
          name: 'Test Campaign',
          description: 'Test Campaign Description',
          rpg_world_id: uuidv4()
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RPG_WORLD_NOT_FOUND');
    });

    it('should return 400 if campaign with same name already exists in the same RPG World', async () => {
      // Create test data
      const rpgWorldId = uuidv4();
      const existingCampaign = {
        campaign_id: uuidv4(),
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: rpgWorldId,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockRPGWorldRepository.findById.mockResolvedValue({
        rpg_world_id: rpgWorldId,
        name: 'Test RPG World',
        description: 'Test RPG World Description',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      });
      mockCampaignRepository.findByName.mockResolvedValue(existingCampaign);

      // Make request
      const response = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', Bearer )
        .send({
          name: 'Test Campaign',
          description: 'Test Campaign Description',
          rpg_world_id: rpgWorldId
        });

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_NAME_EXISTS');
    });
  });

  describe('PUT /api/v1/campaigns/:id', () => {
    it('should update campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const userId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: userId
      };
      const updatedCampaign = {
        ...campaign,
        name: 'Updated Campaign',
        description: 'Updated Description'
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isOwner.mockResolvedValue(true);
      mockCampaignRepository.findByName.mockResolvedValue(null);
      mockCampaignRepository.update.mockResolvedValue(updatedCampaign);

      // Make request
      const response = await request(app)
        .put(/api/v1/campaigns/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Campaign',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        campaign_id: campaignId,
        name: 'Updated Campaign',
        description: 'Updated Description'
      }));
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put(/api/v1/campaigns/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Campaign',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });

    it('should return 403 if user is not the owner of the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isOwner.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .put(/api/v1/campaigns/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Campaign',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/campaigns/:id', () => {
    it('should delete campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isOwner.mockResolvedValue(true);
      mockCampaignRepository.delete.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .delete(/api/v1/campaigns/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .delete(/api/v1/campaigns/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });

    it('should return 403 if user is not the owner of the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isOwner.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .delete(/api/v1/campaigns/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 if campaign has sessions', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isOwner.mockResolvedValue(true);
      mockCampaignRepository.delete.mockImplementation(() => {
        throw new Error('Cannot delete campaign with associated sessions');
      });

      // Make request
      const response = await request(app)
        .delete(/api/v1/campaigns/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_HAS_SESSIONS');
    });
  });

  describe('GET /api/v1/campaigns/:id/users', () => {
    it('should return users for campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };
      const users = [
        {
          user_id: uuidv4(),
          username: 'user1',
          email: 'user1@example.com',
          relationship_type: CampaignUserRelationshipType.OWNER
        },
        {
          user_id: uuidv4(),
          username: 'user2',
          email: 'user2@example.com',
          relationship_type: CampaignUserRelationshipType.PLAYER
        }
      ];

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockCampaignRepository.getUsers.mockResolvedValue(users);

      // Make request
      const response = await request(app)
        .get(/api/v1/campaigns//users)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].username).toBe('user1');
      expect(response.body.data[1].username).toBe('user2');
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/campaigns//users)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const campaign = {
        campaign_id: campaignId,
        name: 'Test Campaign',
        description: 'Test Campaign Description',
        rpg_world_id: uuidv4(),
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockCampaignRepository.findById.mockResolvedValue(campaign);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/campaigns//users)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
