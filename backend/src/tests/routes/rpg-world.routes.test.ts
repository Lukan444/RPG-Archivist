import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { RPGWorldRepository } from '../../repositories/rpg-world.repository';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import { generateToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/rpg-world.repository');
jest.mock('../../repositories/user.repository');

describe('RPG World Routes', () => {
  let mockRPGWorldRepository: jest.Mocked<RPGWorldRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;
  let adminToken: string;
  let userToken: string;

  beforeEach(() => {
    // Create mock repositories
    mockRPGWorldRepository = new RPGWorldRepository(null as any) as jest.Mocked<RPGWorldRepository>;
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
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

  describe('GET /api/v1/rpg-worlds', () => {
    it('should return all RPG Worlds', async () => {
      // Mock repository method
      mockRPGWorldRepository.findAll.mockResolvedValue([
        {
          rpg_world_id: uuidv4(),
          name: 'D&D 5e',
          description: 'Dungeons & Dragons 5th Edition',
          system_version: '5e',
          created_at: new Date()
        },
        {
          rpg_world_id: uuidv4(),
          name: 'Pathfinder',
          description: 'Pathfinder RPG',
          system_version: '2e',
          created_at: new Date()
        }
      ]);

      // Make request
      const response = await request(app)
        .get('/api/v1/rpg-worlds')
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('D&D 5e');
      expect(response.body.data[1].name).toBe('Pathfinder');
    });

    it('should return 401 if not authenticated', async () => {
      // Make request
      const response = await request(app)
        .get('/api/v1/rpg-worlds');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/rpg-worlds/:id', () => {
    it('should return RPG World by ID', async () => {
      // Create test data
      const rpgWorldId = uuidv4();
      const rpgWorld = {
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e',
        created_at: new Date()
      };

      // Mock repository method
      mockRPGWorldRepository.findById.mockResolvedValue(rpgWorld);

      // Make request
      const response = await request(app)
        .get(/api/v1/rpg-worlds/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e'
      }));
    });

    it('should return 404 if RPG World not found', async () => {
      // Mock repository method
      mockRPGWorldRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .get(/api/v1/rpg-worlds/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RPG_WORLD_NOT_FOUND');
    });
  });

  describe('POST /api/v1/rpg-worlds', () => {
    it('should create a new RPG World', async () => {
      // Create test data
      const rpgWorldId = uuidv4();
      const rpgWorld = {
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e',
        created_at: new Date()
      };

      // Mock repository methods
      mockRPGWorldRepository.findByName.mockResolvedValue(null);
      mockRPGWorldRepository.create.mockResolvedValue(rpgWorld);

      // Make request
      const response = await request(app)
        .post('/api/v1/rpg-worlds')
        .set('Authorization', Bearer )
        .send({
          name: 'D&D 5e',
          description: 'Dungeons & Dragons 5th Edition',
          system_version: '5e'
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e'
      }));
    });

    it('should return 400 if RPG World with same name already exists', async () => {
      // Mock repository method
      mockRPGWorldRepository.findByName.mockResolvedValue({
        rpg_world_id: uuidv4(),
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e',
        created_at: new Date()
      });

      // Make request
      const response = await request(app)
        .post('/api/v1/rpg-worlds')
        .set('Authorization', Bearer )
        .send({
          name: 'D&D 5e',
          description: 'Dungeons & Dragons 5th Edition',
          system_version: '5e'
        });

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RPG_WORLD_NAME_EXISTS');
    });
  });

  describe('PUT /api/v1/rpg-worlds/:id', () => {
    it('should update RPG World', async () => {
      // Create test data
      const rpgWorldId = uuidv4();
      const rpgWorld = {
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e',
        created_at: new Date()
      };
      const updatedRPGWorld = {
        ...rpgWorld,
        name: 'D&D 5e Updated',
        description: 'Updated description'
      };

      // Mock repository methods
      mockRPGWorldRepository.findById.mockResolvedValue(rpgWorld);
      mockRPGWorldRepository.findByName.mockResolvedValue(null);
      mockRPGWorldRepository.update.mockResolvedValue(updatedRPGWorld);

      // Make request
      const response = await request(app)
        .put(/api/v1/rpg-worlds/)
        .set('Authorization', Bearer )
        .send({
          name: 'D&D 5e Updated',
          description: 'Updated description'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e Updated',
        description: 'Updated description'
      }));
    });

    it('should return 404 if RPG World not found', async () => {
      // Mock repository method
      mockRPGWorldRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put(/api/v1/rpg-worlds/)
        .set('Authorization', Bearer )
        .send({
          name: 'D&D 5e Updated',
          description: 'Updated description'
        });

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RPG_WORLD_NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/rpg-worlds/:id', () => {
    it('should delete RPG World', async () => {
      // Create test data
      const rpgWorldId = uuidv4();
      const rpgWorld = {
        rpg_world_id: rpgWorldId,
        name: 'D&D 5e',
        description: 'Dungeons & Dragons 5th Edition',
        system_version: '5e',
        created_at: new Date()
      };

      // Mock repository methods
      mockRPGWorldRepository.findById.mockResolvedValue(rpgWorld);
      mockRPGWorldRepository.getCampaigns.mockResolvedValue([]);
      mockRPGWorldRepository.delete.mockResolvedValue(true);

      // Make request
      const response = await request(app)
        .delete(/api/v1/rpg-worlds/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deleted).toBe(true);
    });

    it('should return 404 if RPG World not found', async () => {
      // Mock repository method
      mockRPGWorldRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .delete(/api/v1/rpg-worlds/)
        .set('Authorization', Bearer );

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RPG_WORLD_NOT_FOUND');
    });
  });
});
