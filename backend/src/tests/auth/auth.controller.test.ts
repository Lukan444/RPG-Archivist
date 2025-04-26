import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthController } from '../../controllers/auth.controller';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserRole } from '../../models/user.model';
import config from '../../config';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../repositories/repository.factory');
jest.mock('../../repositories/user.repository');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRepositoryFactory: jest.Mocked<RepositoryFactory>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
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
    
    // Create mock request and response
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Create AuthController instance
    authController = new AuthController(mockRepositoryFactory);
    
    // Mock bcrypt functions
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    // Mock jwt functions
    (jwt.sign as jest.Mock).mockReturnValue('token');
    (jwt.verify as jest.Mock).mockReturnValue({ user_id: mockUser.user_id });
  });

  describe('register', () => {
    beforeEach(() => {
      mockRequest.body = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      
      mockUserRepository.getByUsername.mockResolvedValue(null);
      mockUserRepository.getByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        ...mockUser,
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'newuser',
        email: 'new@example.com',
        name: 'New User',
      });
    });

    it('should register a new user successfully', async () => {
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Verify that the user repository methods were called
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('newuser');
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
      
      // Verify that bcrypt was used to hash the password
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            username: 'newuser',
            email: 'new@example.com',
            name: 'New User',
          }),
        },
      });
      
      // Verify that the password was not included in the response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: expect.not.objectContaining({
              password: expect.anything(),
            }),
          },
        })
      );
    });

    it('should return 409 if username already exists', async () => {
      mockUserRepository.getByUsername.mockResolvedValue(mockUser);
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this username already exists',
        },
      });
      
      // Verify that the user was not created
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should return 409 if email already exists', async () => {
      mockUserRepository.getByUsername.mockResolvedValue(null);
      mockUserRepository.getByEmail.mockResolvedValue(mockUser);
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      });
      
      // Verify that the user was not created
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockUserRepository.getByUsername.mockRejectedValue(new Error('Database error'));
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while registering user',
        },
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123',
      };
      
      mockUserRepository.getByUsername.mockResolvedValue(mockUser);
    });

    it('should login a user successfully', async () => {
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Verify that the user repository methods were called
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      
      // Verify that bcrypt was used to compare the password
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      
      // Verify that JWT tokens were generated
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: mockUser.user_id, username: mockUser.username, role: mockUser.role },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiration }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: mockUser.user_id },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiration }
      );
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            user_id: mockUser.user_id,
            username: mockUser.username,
            email: mockUser.email,
            name: mockUser.name,
          }),
          tokens: {
            access: 'token',
            refresh: 'token',
          },
        },
      });
      
      // Verify that the password was not included in the response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: expect.not.objectContaining({
              password: expect.anything(),
            }),
          },
        })
      );
    });

    it('should return 401 if user does not exist', async () => {
      mockUserRepository.getByUsername.mockResolvedValue(null);
      
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
      
      // Verify that bcrypt was not used
      expect(bcrypt.compare).not.toHaveBeenCalled();
      
      // Verify that JWT tokens were not generated
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 401 if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
      
      // Verify that bcrypt was used
      expect(bcrypt.compare).toHaveBeenCalled();
      
      // Verify that JWT tokens were not generated
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockUserRepository.getByUsername.mockRejectedValue(new Error('Database error'));
      
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while logging in',
        },
      });
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      mockRequest.body = {
        refreshToken: 'refreshtoken',
      };
      
      mockUserRepository.getById.mockResolvedValue(mockUser);
    });

    it('should refresh tokens successfully', async () => {
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);
      
      // Verify that JWT verify was called
      expect(jwt.verify).toHaveBeenCalledWith('refreshtoken', config.jwt.secret);
      
      // Verify that the user repository methods were called
      expect(mockUserRepository.getById).toHaveBeenCalledWith(mockUser.user_id);
      
      // Verify that JWT tokens were generated
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: mockUser.user_id, username: mockUser.username, role: mockUser.role },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiration }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: mockUser.user_id },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiration }
      );
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          tokens: {
            access: 'token',
            refresh: 'token',
          },
        },
      });
    });

    it('should return 401 if refresh token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
      
      // Verify that the user repository methods were not called
      expect(mockUserRepository.getById).not.toHaveBeenCalled();
      
      // Verify that JWT tokens were not generated
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 401 if user does not exist', async () => {
      mockUserRepository.getById.mockResolvedValue(null);
      
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
      
      // Verify that JWT tokens were not generated
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockUserRepository.getById.mockRejectedValue(new Error('Database error'));
      
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);
      
      // Verify that the response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while refreshing token',
        },
      });
    });
  });
});
