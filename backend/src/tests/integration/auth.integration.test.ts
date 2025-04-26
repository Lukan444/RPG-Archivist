import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authRouter } from '../../routes/auth.routes';
import { RepositoryFactory } from '../../repositories/repository.factory';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserRole } from '../../models/user.model';
import { MockDatabaseService } from '../mocks/mock-database';

// This test requires a running Neo4j database
// It will be skipped if the environment variable SKIP_INTEGRATION_TESTS is set to 'true'
const skipTests = process.env.SKIP_INTEGRATION_TESTS === 'true';

describe('Auth Integration', () => {
  let app: express.Application;
  let mockDbService: MockDatabaseService;
  let repositoryFactory: RepositoryFactory;
  let userRepository: UserRepository;
  let testUser: User;

  beforeAll(async () => {
    if (skipTests) {
      return;
    }

    // Create mock database service
    mockDbService = new MockDatabaseService();
    
    // Initialize repository factory
    repositoryFactory = new RepositoryFactory(mockDbService);
    
    // Get user repository
    userRepository = repositoryFactory.getUserRepository();
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: UserRole.PLAYER,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    // Set up mock data
    mockDbService.setMockData('User', [testUser]);
    
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create router
    const router = authRouter(repositoryFactory);
    app.use('/auth', router);
  });

  // Skip all tests if SKIP_INTEGRATION_TESTS is true
  beforeEach(() => {
    if (skipTests) {
      console.log('Skipping integration tests');
      return;
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      if (skipTests) return;
      
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
          user: expect.objectContaining({
            username: 'newuser',
            email: 'new@example.com',
            name: 'New User',
          }),
        },
      });
      
      // Verify that the password is not included in the response
      expect(response.body.data.user).not.toHaveProperty('password');
      
      // Verify that the user was created in the database
      const users = mockDbService.getMockData('User');
      const newUser = users.find(user => user.username === 'newuser');
      expect(newUser).toBeDefined();
      expect(newUser).toEqual(expect.objectContaining({
        username: 'newuser',
        email: 'new@example.com',
        name: 'New User',
      }));
    });

    it('should return 409 if username already exists', async () => {
      if (skipTests) return;
      
      // Make request with existing username
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser', // Existing username
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      
      // Verify response
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this username already exists',
        },
      });
    });

    it('should return 409 if email already exists', async () => {
      if (skipTests) return;
      
      // Make request with existing email
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser2',
          email: 'test@example.com', // Existing email
          password: 'password123',
          name: 'New User',
        });
      
      // Verify response
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user with valid credentials', async () => {
      if (skipTests) return;
      
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
          user: expect.objectContaining({
            user_id: testUser.user_id,
            username: testUser.username,
            email: testUser.email,
            name: testUser.name,
          }),
          tokens: {
            access: expect.any(String),
            refresh: expect.any(String),
          },
        },
      });
      
      // Verify that the password is not included in the response
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 with invalid username', async () => {
      if (skipTests) return;
      
      // Make request with invalid username
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });
      
      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
    });

    it('should return 401 with invalid password', async () => {
      if (skipTests) return;
      
      // Make request with invalid password
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });
      
      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      if (skipTests) return;
      
      // Login to get a refresh token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });
      
      refreshToken = loginResponse.body.data.tokens.refresh;
    });

    it('should refresh tokens with a valid refresh token', async () => {
      if (skipTests) return;
      
      // Make request
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken,
        });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          tokens: {
            access: expect.any(String),
            refresh: expect.any(String),
          },
        },
      });
    });

    it('should return 401 with an invalid refresh token', async () => {
      if (skipTests) return;
      
      // Make request with invalid refresh token
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        });
      
      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
    });
  });
});
