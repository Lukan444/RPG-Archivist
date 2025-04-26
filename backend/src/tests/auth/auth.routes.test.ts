import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { authRouter } from '../../routes/auth.routes';
import { AuthController } from '../../controllers/auth.controller';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserRole } from '../../models/user.model';

// Mock dependencies
jest.mock('../../controllers/auth.controller');
jest.mock('../../repositories/repository.factory');
jest.mock('../../repositories/user.repository');

describe('Auth Routes', () => {
  let app: express.Application;
  let mockRepositoryFactory: jest.Mocked<RepositoryFactory>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthController: jest.Mocked<AuthController>;
  let mockUser: User;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock user
    mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Create mock repositories
    mockUserRepository = {
      getByUsername: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    
    mockRepositoryFactory = {
      getUserRepository: jest.fn().mockReturnValue(mockUserRepository),
    } as unknown as jest.Mocked<RepositoryFactory>;
    
    // Create mock controller
    mockAuthController = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
    } as unknown as jest.Mocked<AuthController>;
    
    // Mock AuthController constructor
    (AuthController as jest.Mock).mockImplementation(() => mockAuthController);
    
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create router
    const router = authRouter(mockRepositoryFactory);
    app.use('/auth', router);
  });

  describe('POST /auth/register', () => {
    it('should call register controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockAuthController.register.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            user: {
              user_id: mockUser.user_id,
              username: req.body.username,
              email: req.body.email,
              name: req.body.name,
            },
          },
        });
      });
      
      // Make request
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      
      // Verify response
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: {
            user_id: mockUser.user_id,
            username: 'newuser',
            email: 'new@example.com',
            name: 'New User',
          },
        },
      });
      
      // Verify that controller method was called
      expect(mockAuthController.register).toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid data', async () => {
      // Make request with invalid data
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'a', // Too short
          email: 'invalid-email', // Invalid email
          password: '123', // Too short
        });
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array),
        },
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'username',
          msg: 'Username must be between 3 and 30 characters',
        })
      );
      
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'email',
          msg: 'Invalid email format',
        })
      );
      
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'password',
          msg: 'Password must be at least 8 characters long',
        })
      );
      
      // Verify that controller method was not called
      expect(mockAuthController.register).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should call login controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockAuthController.login.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            user: {
              user_id: mockUser.user_id,
              username: mockUser.username,
              email: mockUser.email,
              name: mockUser.name,
            },
            tokens: {
              access: 'access-token',
              refresh: 'refresh-token',
            },
          },
        });
      });
      
      // Make request
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: {
            user_id: mockUser.user_id,
            username: mockUser.username,
            email: mockUser.email,
            name: mockUser.name,
          },
          tokens: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        },
      });
      
      // Verify that controller method was called
      expect(mockAuthController.login).toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid data', async () => {
      // Make request with invalid data
      const response = await request(app)
        .post('/auth/login')
        .send({
          // Missing username and password
        });
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array),
        },
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'username',
          msg: 'Username is required',
        })
      );
      
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'password',
          msg: 'Password is required',
        })
      );
      
      // Verify that controller method was not called
      expect(mockAuthController.login).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call refreshToken controller method with valid data', async () => {
      // Set up controller method to handle the request
      mockAuthController.refreshToken.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            tokens: {
              access: 'new-access-token',
              refresh: 'new-refresh-token',
            },
          },
        });
      });
      
      // Make request
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: 'valid-refresh-token',
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          tokens: {
            access: 'new-access-token',
            refresh: 'new-refresh-token',
          },
        },
      });
      
      // Verify that controller method was called
      expect(mockAuthController.refreshToken).toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid data', async () => {
      // Make request with invalid data
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          // Missing refreshToken
        });
      
      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array),
        },
      });
      
      // Verify that validation errors are returned
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({
          param: 'refreshToken',
          msg: 'Refresh token is required',
        })
      );
      
      // Verify that controller method was not called
      expect(mockAuthController.refreshToken).not.toHaveBeenCalled();
    });
  });
});
