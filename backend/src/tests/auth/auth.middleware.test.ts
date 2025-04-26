import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { UserRole } from '../../models/user.model';
import config from '../../config';

// Mock dependencies
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock request, response, and next function
    mockRequest = {
      headers: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
    
    // Create AuthMiddleware instance
    authMiddleware = new AuthMiddleware();
    
    // Mock jwt.verify
    (jwt.verify as jest.Mock).mockReturnValue({
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.PLAYER,
      name: 'Test User',
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user with a valid token', () => {
      // Set up request with authorization header
      mockRequest.headers = {
        authorization: 'Bearer validtoken',
      };
      
      // Call authenticate
      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that jwt.verify was called
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', config.jwt.secret);
      
      // Verify that the user was added to the request
      expect((mockRequest as AuthRequest).user).toEqual({
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        name: 'Test User',
      });
      
      // Verify that next was called
      expect(mockNext).toHaveBeenCalled();
      
      // Verify that response methods were not called
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is missing', () => {
      // Call authenticate
      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that jwt.verify was not called
      expect(jwt.verify).not.toHaveBeenCalled();
      
      // Verify that the user was not added to the request
      expect((mockRequest as AuthRequest).user).toBeUndefined();
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      // Set up request with invalid authorization header
      mockRequest.headers = {
        authorization: 'InvalidToken',
      };
      
      // Call authenticate
      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that jwt.verify was not called
      expect(jwt.verify).not.toHaveBeenCalled();
      
      // Verify that the user was not added to the request
      expect((mockRequest as AuthRequest).user).toBeUndefined();
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    it('should return 401 if token is invalid', () => {
      // Set up request with authorization header
      mockRequest.headers = {
        authorization: 'Bearer invalidtoken',
      };
      
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Call authenticate
      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that jwt.verify was called
      expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', config.jwt.secret);
      
      // Verify that the user was not added to the request
      expect((mockRequest as AuthRequest).user).toBeUndefined();
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      // Set up request with user
      (mockRequest as AuthRequest).user = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        name: 'Test User',
      };
    });

    it('should allow access if user has the required role', () => {
      // Create middleware function
      const middleware = authMiddleware.hasRole(UserRole.PLAYER);
      
      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that next was called
      expect(mockNext).toHaveBeenCalled();
      
      // Verify that response methods were not called
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should allow access if user has one of the required roles', () => {
      // Create middleware function
      const middleware = authMiddleware.hasRole([UserRole.ADMIN, UserRole.PLAYER]);
      
      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that next was called
      expect(mockNext).toHaveBeenCalled();
      
      // Verify that response methods were not called
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      // Remove user from request
      delete (mockRequest as AuthRequest).user;
      
      // Create middleware function
      const middleware = authMiddleware.hasRole(UserRole.PLAYER);
      
      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    it('should return 403 if user does not have a role', () => {
      // Remove role from user
      delete (mockRequest as AuthRequest).user!.role;
      
      // Create middleware function
      const middleware = authMiddleware.hasRole(UserRole.PLAYER);
      
      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    });

    it('should return 403 if user does not have the required role', () => {
      // Set user role to GAME_MASTER
      (mockRequest as AuthRequest).user!.role = UserRole.GAME_MASTER;
      
      // Create middleware function
      const middleware = authMiddleware.hasRole(UserRole.ADMIN);
      
      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    });

    it('should return 403 if user does not have any of the required roles', () => {
      // Set user role to PLAYER
      (mockRequest as AuthRequest).user!.role = UserRole.PLAYER;
      
      // Create middleware function
      const middleware = authMiddleware.hasRole([UserRole.ADMIN, UserRole.GAME_MASTER]);
      
      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Verify that next was not called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Verify that response methods were called
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    });
  });
});
