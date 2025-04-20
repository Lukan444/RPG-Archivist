import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { SessionRepository } from '../../repositories/session.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/session.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/user.repository');

describe('Session Routes', () => {
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockSessionRepository = new SessionRepository(null as any) as jest.Mocked<SessionRepository>;
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getSessionRepository: jest.fn().mockReturnValue(mockSessionRepository),
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

  describe('GET /api/v1/sessions', () => {
    it('should return all sessions', async () => {
      // Mock repository method
      mockSessionRepository.findAll.mockResolvedValue({
        sessions: [
          {
            session_id: uuidv4(),
            campaign_id: uuidv4(),
            name: 'Test Session 1',
            description: 'Test Session 1 Description',
            number: 1,
            is_completed: false,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            session_id: uuidv4(),
            campaign_id: uuidv4(),
            name: 'Test Session 2',
            description: 'Test Session 2 Description',
            number: 2,
            is_completed: true,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get('/api/v1/sessions')
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Test Session 1');
      expect(response.body.data[1].name).toBe('Test Session 2');
    });

    it('should return 401 if not authenticated', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/sessions');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/sessions/:id', () => {
    it('should return session by ID', async () => {
      // Create test data
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: uuidv4(),
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository method
      mockSessionRepository.findById.mockResolvedValue(session);

      // Make request
      const response = await request(app)
        .get(/api/v1/sessions/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        session_id: sessionId,
        name: 'Test Session',
        description: 'Test Session Description'
      }));
    });

    it('should return 404 if session not found', async () => {
      // Mock repository method
      mockSessionRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/sessions/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('POST /api/v1/sessions', () => {
    it('should create a new session', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
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
      mockSessionRepository.create.mockResolvedValue(session);

      // Make request
      const response = await request(app)
        .post('/api/v1/sessions')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Session',
          description: 'Test Session Description',
          number: 1
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description'
      }));
    });

    it('should return 404 if campaign not found', async () => {
      // Mock repository method
      mockCampaignRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/sessions')
        .set('Authorization', Bearer )
        .send({
          campaign_id: uuidv4(),
          name: 'Test Session',
          description: 'Test Session Description',
          number: 1
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
        .post('/api/v1/sessions')
        .set('Authorization', Bearer )
        .send({
          campaign_id: campaignId,
          name: 'Test Session',
          description: 'Test Session Description',
          number: 1
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PUT /api/v1/sessions/:id', () => {
    it('should update session', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };
      const updatedSession = {
        ...session,
        name: 'Updated Session',
        description: 'Updated Description',
        is_completed: true
      };

      // Mock repository methods
      mockSessionRepository.findById.mockResolvedValue(session);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockSessionRepository.update.mockResolvedValue(updatedSession);

      // Make request
      const response = await request(app)
        .put(/api/v1/sessions/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Session',
          description: 'Updated Description',
          is_completed: true
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        session_id: sessionId,
        name: 'Updated Session',
        description: 'Updated Description',
        is_completed: true
      }));
    });

    it('should return 404 if session not found', async () => {
      // Mock repository method
      mockSessionRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put(/api/v1/sessions/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Session',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockSessionRepository.findById.mockResolvedValue(session);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .put(/api/v1/sessions/)
        .set('Authorization', Bearer )
        .send({
          name: 'Updated Session',
          description: 'Updated Description'
        });

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/sessions/:id', () => {
    it('should delete session', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockSessionRepository.findById.mockResolvedValue(session);
      mockCampaignRepository.isOwner.mockResolvedValue(true);
      mockSessionRepository.delete.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .delete(/api/v1/sessions/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
    });

    it('should return 404 if session not found', async () => {
      // Mock repository method
      mockSessionRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .delete(/api/v1/sessions/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });

    it('should return 403 if user is not the owner of the campaign', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockSessionRepository.findById.mockResolvedValue(session);
      mockCampaignRepository.isOwner.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .delete(/api/v1/sessions/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 if session has transcriptions', async () => {
      // Create test data
      const campaignId = uuidv4();
      const sessionId = uuidv4();
      const session = {
        session_id: sessionId,
        campaign_id: campaignId,
        name: 'Test Session',
        description: 'Test Session Description',
        number: 1,
        is_completed: false,
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockSessionRepository.findById.mockResolvedValue(session);
      mockCampaignRepository.isOwner.mockResolvedValue(true);
      mockSessionRepository.delete.mockImplementation(() => {
        throw new Error('Cannot delete session with associated transcriptions');
      });

      // Make request
      const response = await request(app)
        .delete(/api/v1/sessions/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SESSION_HAS_TRANSCRIPTIONS');
    });
  });
});
