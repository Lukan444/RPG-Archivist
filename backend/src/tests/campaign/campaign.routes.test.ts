import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { campaignRoutes } from '../../routes/campaign.routes';
import { CampaignController } from '../../controllers/campaign.controller';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { RPGWorldRepository } from '../../repositories/rpg-world.repository';
import { UserRepository } from '../../repositories/user.repository';
import { Campaign, CampaignUserRelationshipType } from '../../models/campaign.model';
import { User, UserRole } from '../../models/user.model';
import { RPGWorld } from '../../models/rpg-world.model';

// Mock dependencies
jest.mock('../../controllers/campaign.controller');
jest.mock('../../repositories/repository.factory');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/rpg-world.repository');
jest.mock('../../repositories/user.repository');

describe('Campaign Routes', () => {
  let app: express.Application;
  let mockRepositoryFactory: jest.Mocked<RepositoryFactory>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockRPGWorldRepository: jest.Mocked<RPGWorldRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCampaignController: jest.Mocked<CampaignController>;
  let mockCampaign: Campaign;
  let mockUser: User;
  let mockRPGWorld: RPGWorld;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock campaign
    mockCampaign = {
      campaign_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Campaign',
      description: 'Test Campaign Description',
      rpg_world_id: '223e4567-e89b-12d3-a456-426614174000',
      start_date: new Date().toISOString(),
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Create mock user
    mockUser = {
      user_id: '323e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Create mock RPG World
    mockRPGWorld = {
      rpg_world_id: '223e4567-e89b-12d3-a456-426614174000',
      name: 'Test RPG World',
      description: 'Test RPG World Description',
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Create mock repositories
    mockCampaignRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      isOwner: jest.fn(),
      isParticipant: jest.fn(),
      getUsers: jest.fn(),
      addUser: jest.fn(),
      removeUser: jest.fn(),
      getSessions: jest.fn(),
      getCharacters: jest.fn(),
      getLocations: jest.fn(),
      getStatistics: jest.fn()
    } as unknown as jest.Mocked<CampaignRepository>;
    
    mockRPGWorldRepository = {
      findById: jest.fn()
    } as unknown as jest.Mocked<RPGWorldRepository>;
    
    mockUserRepository = {
      findById: jest.fn()
    } as unknown as jest.Mocked<UserRepository>;
    
    mockRepositoryFactory = {
      getCampaignRepository: jest.fn().mockReturnValue(mockCampaignRepository),
      getRPGWorldRepository: jest.fn().mockReturnValue(mockRPGWorldRepository),
      getUserRepository: jest.fn().mockReturnValue(mockUserRepository)
    } as unknown as jest.Mocked<RepositoryFactory>;
    
    // Create mock controller
    mockCampaignController = {
      getAllCampaigns: jest.fn(),
      getCampaignById: jest.fn(),
      createCampaign: jest.fn(),
      updateCampaign: jest.fn(),
      deleteCampaign: jest.fn(),
      getCampaignUsers: jest.fn(),
      addUserToCampaign: jest.fn(),
      removeUserFromCampaign: jest.fn(),
      updateUserRoleInCampaign: jest.fn(),
      getCampaignSessions: jest.fn(),
      getCampaignCharacters: jest.fn(),
      getCampaignLocations: jest.fn(),
      getCampaignStatistics: jest.fn()
    } as unknown as jest.Mocked<CampaignController>;
    
    // Mock CampaignController constructor
    (CampaignController as jest.Mock).mockImplementation(() => mockCampaignController);
    
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create router
    const router = campaignRoutes(mockRepositoryFactory);
    app.use('/campaigns', router);
  });

  describe('GET /campaigns', () => {
    it('should call getAllCampaigns controller method', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getAllCampaigns.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [mockCampaign],
          meta: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .get('/campaigns')
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockCampaign],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getAllCampaigns).toHaveBeenCalled();
    });
  });

  describe('GET /campaigns/:id', () => {
    it('should call getCampaignById controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getCampaignById.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockCampaign
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/campaigns/${mockCampaign.campaign_id}`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockCampaign
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getCampaignById).toHaveBeenCalled();
    });

    it('should return 400 with invalid ID format', async () => {
      // Make request with invalid ID
      const response = await request(app)
        .get('/campaigns/invalid-id')
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array)
        }
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'id',
          msg: 'Invalid Campaign ID'
        })
      );
      
      // Verify that controller method was not called
      expect(mockCampaignController.getCampaignById).not.toHaveBeenCalled();
    });
  });

  describe('POST /campaigns', () => {
    it('should call createCampaign controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockCampaignController.createCampaign.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: mockCampaign
        });
      });
      
      // Make request
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'New Campaign',
          description: 'New Campaign Description',
          rpg_world_id: '223e4567-e89b-12d3-a456-426614174000'
        });
      
      // Verify response
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockCampaign
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.createCampaign).toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid data', async () => {
      // Make request with invalid data
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', 'Bearer valid-token')
        .send({
          // Missing required fields
        });
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array)
        }
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'name',
          msg: 'Name is required'
        })
      );
      
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'description',
          msg: 'Description is required'
        })
      );
      
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'rpg_world_id',
          msg: 'RPG World ID is required'
        })
      );
      
      // Verify that controller method was not called
      expect(mockCampaignController.createCampaign).not.toHaveBeenCalled();
    });
  });

  describe('PUT /campaigns/:id', () => {
    it('should call updateCampaign controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockCampaignController.updateCampaign.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            ...mockCampaign,
            name: 'Updated Campaign',
            description: 'Updated Campaign Description'
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .put(`/campaigns/${mockCampaign.campaign_id}`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Campaign',
          description: 'Updated Campaign Description'
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockCampaign,
          name: 'Updated Campaign',
          description: 'Updated Campaign Description'
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.updateCampaign).toHaveBeenCalled();
    });

    it('should return 400 with invalid ID format', async () => {
      // Make request with invalid ID
      const response = await request(app)
        .put('/campaigns/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Campaign',
          description: 'Updated Campaign Description'
        });
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array)
        }
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'id',
          msg: 'Invalid Campaign ID'
        })
      );
      
      // Verify that controller method was not called
      expect(mockCampaignController.updateCampaign).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /campaigns/:id', () => {
    it('should call deleteCampaign controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.deleteCampaign.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            deleted: true
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .delete(`/campaigns/${mockCampaign.campaign_id}`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          deleted: true
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.deleteCampaign).toHaveBeenCalled();
    });

    it('should return 400 with invalid ID format', async () => {
      // Make request with invalid ID
      const response = await request(app)
        .delete('/campaigns/invalid-id')
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array)
        }
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'id',
          msg: 'Invalid Campaign ID'
        })
      );
      
      // Verify that controller method was not called
      expect(mockCampaignController.deleteCampaign).not.toHaveBeenCalled();
    });
  });

  describe('GET /campaigns/:id/users', () => {
    it('should call getCampaignUsers controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getCampaignUsers.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              user: mockUser,
              relationship_type: CampaignUserRelationshipType.OWNER
            }
          ]
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/campaigns/${mockCampaign.campaign_id}/users`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [
          {
            user: mockUser,
            relationship_type: CampaignUserRelationshipType.OWNER
          }
        ]
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getCampaignUsers).toHaveBeenCalled();
    });
  });

  describe('POST /campaigns/:id/users', () => {
    it('should call addUserToCampaign controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockCampaignController.addUserToCampaign.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            campaign_id: mockCampaign.campaign_id,
            user_id: mockUser.user_id,
            relationship_type: CampaignUserRelationshipType.PLAYER
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .post(`/campaigns/${mockCampaign.campaign_id}/users`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          user_id: mockUser.user_id,
          relationship_type: CampaignUserRelationshipType.PLAYER
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          campaign_id: mockCampaign.campaign_id,
          user_id: mockUser.user_id,
          relationship_type: CampaignUserRelationshipType.PLAYER
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.addUserToCampaign).toHaveBeenCalled();
    });
  });

  describe('DELETE /campaigns/:id/users/:userId', () => {
    it('should call removeUserFromCampaign controller method with valid IDs', async () => {
      // Set up controller method to handle the request
      mockCampaignController.removeUserFromCampaign.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            removed: true
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .delete(`/campaigns/${mockCampaign.campaign_id}/users/${mockUser.user_id}`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          removed: true
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.removeUserFromCampaign).toHaveBeenCalled();
    });
  });

  describe('PUT /campaigns/:id/users/:userId/role', () => {
    it('should call updateUserRoleInCampaign controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockCampaignController.updateUserRoleInCampaign.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            campaign_id: mockCampaign.campaign_id,
            user_id: mockUser.user_id,
            relationship_type: CampaignUserRelationshipType.GAME_MASTER
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .put(`/campaigns/${mockCampaign.campaign_id}/users/${mockUser.user_id}/role`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          relationship_type: CampaignUserRelationshipType.GAME_MASTER
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          campaign_id: mockCampaign.campaign_id,
          user_id: mockUser.user_id,
          relationship_type: CampaignUserRelationshipType.GAME_MASTER
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.updateUserRoleInCampaign).toHaveBeenCalled();
    });
  });

  describe('GET /campaigns/:id/sessions', () => {
    it('should call getCampaignSessions controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getCampaignSessions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: []
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/campaigns/${mockCampaign.campaign_id}/sessions`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: []
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getCampaignSessions).toHaveBeenCalled();
    });
  });

  describe('GET /campaigns/:id/characters', () => {
    it('should call getCampaignCharacters controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getCampaignCharacters.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: []
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/campaigns/${mockCampaign.campaign_id}/characters`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: []
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getCampaignCharacters).toHaveBeenCalled();
    });
  });

  describe('GET /campaigns/:id/locations', () => {
    it('should call getCampaignLocations controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getCampaignLocations.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: []
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/campaigns/${mockCampaign.campaign_id}/locations`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: []
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getCampaignLocations).toHaveBeenCalled();
    });
  });

  describe('GET /campaigns/:id/statistics', () => {
    it('should call getCampaignStatistics controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockCampaignController.getCampaignStatistics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            sessions_count: 0,
            characters_count: 0,
            locations_count: 0,
            users_count: 1
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/campaigns/${mockCampaign.campaign_id}/statistics`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          sessions_count: 0,
          characters_count: 0,
          locations_count: 0,
          users_count: 1
        }
      });
      
      // Verify that controller method was called
      expect(mockCampaignController.getCampaignStatistics).toHaveBeenCalled();
    });
  });
});
