import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { sessionRoutes } from '../../routes/session.routes';
import { SessionController } from '../../controllers/session.controller';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { SessionRepository } from '../../repositories/session.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { Session } from '../../models/session.model';
import { Campaign } from '../../models/campaign.model';

// Mock dependencies
jest.mock('../../controllers/session.controller');
jest.mock('../../repositories/repository.factory');
jest.mock('../../repositories/session.repository');
jest.mock('../../repositories/campaign.repository');

describe('Session Routes', () => {
  let app: express.Application;
  let mockRepositoryFactory: jest.Mocked<RepositoryFactory>;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockSessionController: jest.Mocked<SessionController>;
  let mockSession: Session;
  let mockCampaign: Campaign;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock session
    mockSession = {
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      campaign_id: '223e4567-e89b-12d3-a456-426614174000',
      name: 'Test Session',
      description: 'Test Session Description',
      number: 1,
      date: new Date().toISOString(),
      duration_minutes: 180,
      is_completed: false,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Create mock campaign
    mockCampaign = {
      campaign_id: '223e4567-e89b-12d3-a456-426614174000',
      name: 'Test Campaign',
      description: 'Test Campaign Description',
      rpg_world_id: '323e4567-e89b-12d3-a456-426614174000',
      start_date: new Date().toISOString(),
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Create mock repositories
    mockSessionRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<SessionRepository>;
    
    mockCampaignRepository = {
      findById: jest.fn(),
      isParticipant: jest.fn(),
      isOwner: jest.fn()
    } as unknown as jest.Mocked<CampaignRepository>;
    
    mockRepositoryFactory = {
      getSessionRepository: jest.fn().mockReturnValue(mockSessionRepository),
      getCampaignRepository: jest.fn().mockReturnValue(mockCampaignRepository)
    } as unknown as jest.Mocked<RepositoryFactory>;
    
    // Create mock controller
    mockSessionController = {
      getAllSessions: jest.fn(),
      getSessionById: jest.fn(),
      createSession: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn()
    } as unknown as jest.Mocked<SessionController>;
    
    // Mock SessionController constructor
    (SessionController as jest.Mock).mockImplementation(() => mockSessionController);
    
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create router
    const router = sessionRoutes(mockRepositoryFactory);
    app.use('/sessions', router);
  });

  describe('GET /sessions', () => {
    it('should call getAllSessions controller method', async () => {
      // Set up controller method to handle the request
      mockSessionController.getAllSessions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [mockSession],
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
        .get('/sessions')
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockSession],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1
        }
      });
      
      // Verify that controller method was called
      expect(mockSessionController.getAllSessions).toHaveBeenCalled();
    });
  });

  describe('GET /sessions/:id', () => {
    it('should call getSessionById controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockSessionController.getSessionById.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockSession
        });
      });
      
      // Make request
      const response = await request(app)
        .get(`/sessions/${mockSession.session_id}`)
        .set('Authorization', 'Bearer valid-token');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockSession
      });
      
      // Verify that controller method was called
      expect(mockSessionController.getSessionById).toHaveBeenCalled();
    });

    it('should return 400 with invalid ID format', async () => {
      // Make request with invalid ID
      const response = await request(app)
        .get('/sessions/invalid-id')
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
          msg: 'Invalid Session ID'
        })
      );
      
      // Verify that controller method was not called
      expect(mockSessionController.getSessionById).not.toHaveBeenCalled();
    });
  });

  describe('POST /sessions', () => {
    it('should call createSession controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockSessionController.createSession.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: mockSession
        });
      });
      
      // Make request
      const response = await request(app)
        .post('/sessions')
        .set('Authorization', 'Bearer valid-token')
        .send({
          campaign_id: mockCampaign.campaign_id,
          name: 'New Session',
          description: 'New Session Description',
          number: 1,
          date: new Date().toISOString(),
          duration_minutes: 180,
          is_completed: false
        });
      
      // Verify response
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockSession
      });
      
      // Verify that controller method was called
      expect(mockSessionController.createSession).toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid data', async () => {
      // Make request with invalid data
      const response = await request(app)
        .post('/sessions')
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
          param: 'campaign_id',
          msg: 'Campaign ID is required'
        })
      );
      
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'name',
          msg: 'Name is required'
        })
      );
      
      // Verify that controller method was not called
      expect(mockSessionController.createSession).not.toHaveBeenCalled();
    });
  });

  describe('PUT /sessions/:id', () => {
    it('should call updateSession controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockSessionController.updateSession.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            ...mockSession,
            name: 'Updated Session',
            description: 'Updated Session Description'
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .put(`/sessions/${mockSession.session_id}`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Session',
          description: 'Updated Session Description'
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockSession,
          name: 'Updated Session',
          description: 'Updated Session Description'
        }
      });
      
      // Verify that controller method was called
      expect(mockSessionController.updateSession).toHaveBeenCalled();
    });

    it('should return 400 with invalid ID format', async () => {
      // Make request with invalid ID
      const response = await request(app)
        .put('/sessions/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Session',
          description: 'Updated Session Description'
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
          msg: 'Invalid Session ID'
        })
      );
      
      // Verify that controller method was not called
      expect(mockSessionController.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /sessions/:id', () => {
    it('should call deleteSession controller method with valid ID', async () => {
      // Set up controller method to handle the request
      mockSessionController.deleteSession.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            deleted: true
          }
        });
      });
      
      // Make request
      const response = await request(app)
        .delete(`/sessions/${mockSession.session_id}`)
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
      expect(mockSessionController.deleteSession).toHaveBeenCalled();
    });

    it('should return 400 with invalid ID format', async () => {
      // Make request with invalid ID
      const response = await request(app)
        .delete('/sessions/invalid-id')
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
          msg: 'Invalid Session ID'
        })
      );
      
      // Verify that controller method was not called
      expect(mockSessionController.deleteSession).not.toHaveBeenCalled();
    });
  });
});
