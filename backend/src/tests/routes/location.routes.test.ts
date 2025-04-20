import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { LocationRepository } from '../../repositories/location.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/location.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/user.repository');

describe('Location Routes', () => {
  let mockLocationRepository: jest.Mocked<LocationRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockLocationRepository = new LocationRepository(null as any) as jest.Mocked<LocationRepository>;
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
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

  describe('GET /api/v1/locations', () => {
    it('should return all locations', async () => {
      // Mock repository method
      mockLocationRepository.findAll.mockResolvedValue({
        locations: [
          {
            location_id: uuidv4(),
            campaign_id: uuidv4(),
            name: 'Test Location 1',
            description: 'Test Location 1 Description',
            location_type: 'city',
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            location_id: uuidv4(),
            campaign_id: uuidv4(),
            name: 'Test Location 2',
            description: 'Test Location 2 Description',
            location_type: 'dungeon',
            parent_location_id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get('/api/v1/locations')
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Test Location 1');
      expect(response.body.data[1].name).toBe('Test Location 2');
    });

    it('should return 401 if not authenticated', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/locations');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/locations/:id', () => {
    it('should return location by ID', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .get(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        location_id: locationId,
        name: 'Test Location',
        description: 'Test Location Description'
      }));
    });

    it('should return 404 if location not found', async () => {
      // Mock repository method
      mockLocationRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/locations', () => {
    it('should create a new location', async () => {
      // Create test data
      const campaignId = uuidv4();
      const locationId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
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
      mockLocationRepository.create.mockResolvedValue(location);

      // Make request
      const response = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Location',
          description: 'Test Location Description',
          location_type: 'city'
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description'
      }));
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', Bearer )
        .send({
          campaign_id: uuidv4(),
          name: 'Test Location',
          description: 'Test Location Description',
          location_type: 'city'
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
        .post('/api/v1/locations')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Location',
          description: 'Test Location Description',
          location_type: 'city'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 if parent location not found', async () => {
      // Create test data
      const campaignId = uuidv4();
      const parentLocationId = uuidv4();

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
      mockLocationRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Location',
          description: 'Test Location Description',
          location_type: 'city',
          parent_location_id: parentLocationId
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PARENT_LOCATION_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/locations/:id', () => {
    it('should update location', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };
      const updatedLocation = {
        ...location,
        name: 'Updated Location',
        description: 'Updated Description'
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockLocationRepository.update.mockResolvedValue(updatedLocation);

      // Make request
      const response = await request(app)
        .put(/api/v1/locations/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Location',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        location_id: locationId,
        name: 'Updated Location',
        description: 'Updated Description'
      }));
    });

    it('should return 404 if location not found', async () => {
      // Mock repository method
      mockLocationRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put(/api/v1/locations/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Location',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .put(/api/v1/locations/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Location',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 if location would be its own parent', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .put(/api/v1/locations/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Location',
          description: 'Updated Description',
          parent_location_id: locationId
        });

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PARENT_LOCATION');
    });
  });

  describe('DELETE /api/v1/locations/:id', () => {
    it('should delete location', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockLocationRepository.delete.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .delete(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
    });

    it('should return 404 if location not found', async () => {
      // Mock repository method
      mockLocationRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .delete(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .delete(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 if location has children', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockLocationRepository.delete.mockImplementation(() => {
        throw new Error('Cannot delete location with child locations');
      });

      // Make request
      const response = await request(app)
        .delete(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_HAS_CHILDREN');
    });

    it('should return 400 if location has relationships', async () => {
      // Create test data
      const locationId = uuidv4();
      const campaignId = uuidv4();
      const location = {
        location_id: locationId,
        campaign_id: campaignId,
        name: 'Test Location',
        description: 'Test Location Description',
        location_type: 'city',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockLocationRepository.findById.mockResolvedValue(location);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockLocationRepository.delete.mockImplementation(() => {
        throw new Error('Cannot delete location with associated relationships');
      });

      // Make request
      const response = await request(app)
        .delete(/api/v1/locations/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_HAS_RELATIONSHIPS');
    });
  });
});
