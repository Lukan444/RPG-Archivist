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
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    mockUserRepository = {
      getByUsername: jest.fn(),
      getByEmail: jest.fn(),
      create: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockRepositoryFactory = {
      getUserRepository: jest.fn().mockReturnValue(mockUserRepository),
    } as unknown as jest.Mocked<RepositoryFactory>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockUser = {
      user_id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    // Create controller instance
    authController = new AuthController(mockRepositoryFactory);
  });

  describe('register', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      };

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue(mockUser);
    });

    it('should register a new user successfully', async () => {
      // Arrange
      mockUserRepository.getByUsername.mockResolvedValue(null);
      mockUserRepository.getByEmail.mockResolvedValue(null);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
        role: UserRole.PLAYER,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            user_id: 'test-user-id',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.PLAYER,
          }),
        },
      });
      // Password should not be included in the response
      expect(mockResponse.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: expect.objectContaining({
              password: expect.anything(),
            }),
          },
        })
      );
    });

    it('should return 409 if username already exists', async () => {
      // Arrange
      mockUserRepository.getByUsername.mockResolvedValue(mockUser);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this username already exists',
        },
      });
    });

    it('should return 409 if email already exists', async () => {
      // Arrange
      mockUserRepository.getByUsername.mockResolvedValue(null);
      mockUserRepository.getByEmail.mockResolvedValue(mockUser);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      });
    });

    it('should return 500 if an error occurs', async () => {
      // Arrange
      mockUserRepository.getByUsername.mockRejectedValue(new Error('Database error'));

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
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
      mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
        if (payload.user_id && payload.username && payload.role) {
          return 'access-token';
        } else {
          return 'refresh-token';
        }
      });
      mockUserRepository.getByUsername.mockResolvedValue(mockUser);
    });

    it('should login a user successfully', async () => {
      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            user_id: 'test-user-id',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.PLAYER,
          }),
          tokens: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        },
      });
      // Password should not be included in the response
      expect(mockResponse.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: expect.objectContaining({
              password: expect.anything(),
            }),
          },
        })
      );
    });

    it('should return 401 if user does not exist', async () => {
      // Arrange
      mockUserRepository.getByUsername.mockResolvedValue(null);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
    });

    it('should return 401 if password is invalid', async () => {
      // Arrange
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
    });

    it('should return 500 if an error occurs', async () => {
      // Arrange
      mockUserRepository.getByUsername.mockRejectedValue(new Error('Database error'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
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
      mockRequest = {
        body: {
          refreshToken: 'valid-refresh-token',
        },
      };

      (jwt.verify as jest.Mock).mockReturnValue({ user_id: 'test-user-id' });
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
        if (payload.user_id && payload.username && payload.role) {
          return 'new-access-token';
        } else {
          return 'new-refresh-token';
        }
      });
      mockUserRepository.getById.mockResolvedValue(mockUser);
    });

    it('should refresh tokens successfully', async () => {
      // Act
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', config.jwt.secret);
      expect(mockUserRepository.getById).toHaveBeenCalledWith('test-user-id');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          tokens: {
            access: 'new-access-token',
            refresh: 'new-refresh-token',
          },
        },
      });
    });

    it('should return 401 if refresh token is invalid', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', config.jwt.secret);
      expect(mockUserRepository.getById).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
    });

    it('should return 401 if user does not exist', async () => {
      // Arrange
      mockUserRepository.getById.mockResolvedValue(null);

      // Act
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', config.jwt.secret);
      expect(mockUserRepository.getById).toHaveBeenCalledWith('test-user-id');
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
    });

    it('should return 500 if an error occurs', async () => {
      // Arrange
      mockUserRepository.getById.mockRejectedValue(new Error('Database error'));

      // Act
      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      // Assert
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