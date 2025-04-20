import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { ItemRepository } from '../../repositories/item.repository';
import { CharacterRepository } from '../../repositories/character.repository';
import { LocationRepository } from '../../repositories/location.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { ItemType, ItemRarity } from '../../models/item.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/item.repository');
jest.mock('../../repositories/character.repository');
jest.mock('../../repositories/location.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/user.repository');

describe('Item Routes', () => {
  let mockItemRepository: jest.Mocked<ItemRepository>;
  let mockCharacterRepository: jest.Mocked<CharacterRepository>;
  let mockLocationRepository: jest.Mocked<LocationRepository>;
  let mockCampaignRepository: jest.Mocked<CampaignRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockItemRepository = new ItemRepository(null as any) as jest.Mocked<ItemRepository>;
    mockCharacterRepository = new CharacterRepository(null as any) as jest.Mocked<CharacterRepository>;
    mockLocationRepository = new LocationRepository(null as any) as jest.Mocked<LocationRepository>;
    mockCampaignRepository = new CampaignRepository(null as any) as jest.Mocked<CampaignRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getItemRepository: jest.fn().mockReturnValue(mockItemRepository),
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

  describe('GET /api/v1/items', () => {
    it('should return all items', async () => {
      // Create test data
      const campaignId = uuidv4();

      // Mock repository methods
      mockCampaignRepository.isParticipant.mockResolvedValue(true);
      mockItemRepository.findAll.mockResolvedValue({
        items: [
          {
            item_id: uuidv4(),
            campaign_id: campaignId,
            name: 'Sword of Truth',
            description: 'A magical sword',
            item_type: ItemType.WEAPON,
            rarity: ItemRarity.RARE,
            value: 1000,
            weight: 3,
            properties: 'Deals extra damage against undead',
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          },
          {
            item_id: uuidv4(),
            campaign_id: campaignId,
            name: 'Healing Potion',
            description: 'Restores health',
            item_type: ItemType.POTION,
            rarity: ItemRarity.COMMON,
            value: 50,
            created_at: new Date().toISOString(),
            created_by: uuidv4()
          }
        ],
        total: 2
      });

      // Make request
      const response = await request(app)
        .get(/api/v1/items?campaign_id=)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Sword of Truth');
      expect(response.body.data[1].name).toBe('Healing Potion');
    });

    it('should return 400 if campaign_id is not provided', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/items')
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
        .get(/api/v1/items?campaign_id=)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/items/:id', () => {
    it('should return item by ID', async () => {
      // Create test data
      const itemId = uuidv4();
      const campaignId = uuidv4();
      const item = {
        item_id: itemId,
        campaign_id: campaignId,
        name: 'Sword of Truth',
        description: 'A magical sword',
        item_type: ItemType.WEAPON,
        rarity: ItemRarity.RARE,
        value: 1000,
        weight: 3,
        properties: 'Deals extra damage against undead',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockItemRepository.findById.mockResolvedValue(item);
      mockCampaignRepository.isParticipant.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .get(/api/v1/items/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        item_id: itemId,
        name: 'Sword of Truth',
        description: 'A magical sword'
      }));
    });

    it('should return 404 if item not found', async () => {
      // Mock repository method
      mockItemRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/items/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ITEM_NOT_FOUND');
    });

    it('should return 403 if user is not a participant in the campaign', async () => {
      // Create test data
      const itemId = uuidv4();
      const campaignId = uuidv4();
      const item = {
        item_id: itemId,
        campaign_id: campaignId,
        name: 'Sword of Truth',
        description: 'A magical sword',
        item_type: ItemType.WEAPON,
        rarity: ItemRarity.RARE,
        value: 1000,
        weight: 3,
        properties: 'Deals extra damage against undead',
        created_at: new Date().toISOString(),
        created_by: uuidv4()
      };

      // Mock repository methods
      mockItemRepository.findById.mockResolvedValue(item);
      mockCampaignRepository.isParticipant.mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .get(/api/v1/items/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
