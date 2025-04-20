import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { EventRepository } from '../../repositories/event.repository';
import { CharacterRepository } from '../../repositories/character.repository';
import { ItemRepository } from '../../repositories/item.repository';
import { LocationRepository } from '../../repositories/location.repository';
import { SessionRepository } from '../../repositories/session.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { EventType } from '../../models/event.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/event.repository');
jest.mock('../../repositories/character.repository');
jest.mock('../../repositories/item.repository');
jest.mock('../../repositories/location.repository');
jest.mock('../../repositories/session.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/user.repository');

describe('Event Routes', () => {
  let mockEventRepository: jest.Mocked<EventRepository>;
  let mockCharacterRepository: jest.Mocked<CharacterRepository>;
  let mockItemRepository: jest.Mocked<ItemRepository>;
  let mockLocationRepository: jest.Mocked<LocationRepository>;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockEventRepository = new EventRepository(null as any) as jest.Mocked<EventRepository>;
    mockCharacterRepository = new CharacterRepository(null as any) as jest.Mocked<CharacterRepository>;
    mockItemRepository = new ItemRepository(null as any) as jest.Mocked<ItemRepository>;
    mockLocationRepository = new LocationRepository(null as any) as jest.Mocked<LocationRepository>;
    mockSessionRepository = new SessionRepository(null as any) as jest.Mocked<SessionRepository>;
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getEventRepository: jest.fn().mockReturnValue(mockEventRepository),
      getCharacterRepository: jest.fn().mockReturnValue(mockCharacterRepository),
      getItemRepository: jest.fn().mockReturnValue(mockItemRepository),
      getLocationRepository: jest.fn().mockReturnValue(mockLocationRepository),
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

  describe('GET /api/v1/events', () => {
    it('should return all events', async () => {
      // Create test data
      const campaignId = uuidv4();

      // Mock repository methods
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockEventRepository.findAll.mockResolvedValue({
        events: [
          {
            event_id: uuidv4(),
            campaign_id: campaignId,
            name: 'Battle of Helm\\'s Deep',
            description: 'A major battle in the War of the Ring',
            event_type: EventType.BATTLE,
            event_date: '3019-03-03',
            timeline_position: 1,
            location_id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            event_id: uuidv4(),
            campaign_id: campaignId,
            name: 'Council of Elrond',
            description: 'A secret council called by Elrond',
            event_type: EventType.SOCIAL,
            event_date: '3018-10-25',
            timeline_position: 0,
            location_id: uuidv4(),
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get(/api/v1/events?campaign_id=)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Battle of Helm\\'s Deep');
      expect(response.body.data[1].name).toBe('Council of Elrond');
    });

    it('should return 400 if campaign_id is not provided', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/events')
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
        .get(/api/v1/events?campaign_id=)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('should return event by ID', async () => {
      // Create test data
      const eventId = uuidv4();
      const campaignId = uuidv4();
      const event = {
        event_id: eventId,
        campaign_id: campaignId,
        name: 'Battle of Helm\\'s Deep',
        description: 'A major battle in the War of the Ring',
        event_type: EventType.BATTLE,
        event_date: '3019-03-03',
        timeline_position: 1,
        location_id: uuidv4(),
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockEventRepository.findById.mockResolvedValue(event);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .get(/api/v1/events/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        event_id: eventId,
        name: 'Battle of Helm\\'s Deep',
        description: 'A major battle in the War of the Ring'
      }));
    });

    it('should return 404 if event not found', async () => {
      // Mock repository method
      mockEventRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/events/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EVENT_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const eventId = uuidv4();
      const campaignId = uuidv4();
      const event = {
        event_id: eventId,
        campaign_id: campaignId,
        name: 'Battle of Helm\\'s Deep',
        description: 'A major battle in the War of the Ring',
        event_type: EventType.BATTLE,
        event_date: '3019-03-03',
        timeline_position: 1,
        location_id: uuidv4(),
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockEventRepository.findById.mockResolvedValue(event);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/events/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
