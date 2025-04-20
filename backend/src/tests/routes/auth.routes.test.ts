import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/database.service';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { UserRepository } from '../../repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../models/user.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/auth';

// Mock repositories
jest.mock('../../repositories/user.repository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/auth');

describe('Auth Routes', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRepositoryFactory: Partial<RepositoryFactory>;

  beforeEach(() => {
    // Create mock repositories
    mockUserRepository = new UserRepository(null as any) as jest.Mocked<UserRepository>;

    // Create mock repository factory
    mockRepositoryFactory = {
      getUserRepository: jest.fn().mockReturnValue(mockUserRepository)
    };

    // Mock bcrypt
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    // Mock jwt
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');
    (jwt.verify as jest.Mock).mockReturnValue({ user_id: 'user_id' });

    // Mock auth utils
    (generateToken as jest.Mock).mockReturnValue('mock_token');
    (verifyToken as jest.Mock).mockReturnValue({ user_id: 'user_id' });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      // Create test data
      const userId = uuidv4();
      const user = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      // Mock repository methods
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(user);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirm_password: 'password123'
        });

      // Check response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(expect.objectContaining({
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com'
      }));
      expect(response.body.data.token).toBe('mock_token');
    });

    it('should return 400 if passwords do not match', async () => {
      // Make request
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirm_password: 'password456'
        });

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if email is already in use', async () => {
      // Mock repository method
      mockUserRepository.findByEmail.mockResolvedValue({
        user_id: uuidv4(),
        username: 'existinguser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      });

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirm_password: 'password123'
        });

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_IN_USE');
    });

    it('should return 400 if username is already in use', async () => {
      // Mock repository methods
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue({
        user_id: uuidv4(),
        username: 'testuser',
        email: 'existing@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      });

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirm_password: 'password123'
        });

      // Check response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USERNAME_IN_USE');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user with email', async () => {
      // Create test data
      const userId = uuidv4();
      const user = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      // Mock repository method
      mockUserRepository.findByEmail.mockResolvedValue(user);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(expect.objectContaining({
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com'
      }));
      expect(response.body.data.token).toBe('mock_token');
    });

    it('should login a user with username', async () => {
      // Create test data
      const userId = uuidv4();
      const user = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      // Mock repository methods
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(user);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser',
          password: 'password123'
        });

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(expect.objectContaining({
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com'
      }));
      expect(response.body.data.token).toBe('mock_token');
    });

    it('should return 401 if user not found', async () => {
      // Mock repository methods
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 if password is incorrect', async () => {
      // Create test data
      const userId = uuidv4();
      const user = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      // Mock repository method
      mockUserRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong_password'
        });

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 if user is not active', async () => {
      // Create test data
      const userId = uuidv4();
      const user = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: false
      };

      // Mock repository method
      mockUserRepository.findByEmail.mockResolvedValue(user);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token', async () => {
      // Create test data
      const userId = uuidv4();
      const user = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      // Mock repository method
      mockUserRepository.findById.mockResolvedValue(user);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', 'Bearer mock_token');

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('mock_token');
    });

    it('should return 401 if token is not provided', async () => {
      // Make request
      const response = await request(app)
        .post('/api/v1/auth/refresh');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 if token is invalid', async () => {
      // Mock auth utils
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', 'Bearer invalid_token');

      // Check response
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 404 if user not found', async () => {
      // Mock repository method
      mockUserRepository.findById.mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', 'Bearer mock_token');

      // Check response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});
