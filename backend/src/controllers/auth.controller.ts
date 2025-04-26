import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RepositoryFactory } from '../repositories/repository.factory';
import { User, UserRole } from '../models/user.model';
import config from '../config';

/**
 * Authentication controller
 */
export class AuthController {
  private repositoryFactory: RepositoryFactory;

  /**
   * Constructor
   * @param repositoryFactory Repository factory
   */
  constructor(repositoryFactory: RepositoryFactory) {
    this.repositoryFactory = repositoryFactory;
  }

  /**
   * Register a new user
   * @param req Request
   * @param res Response
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, name } = req.body;

      // Check if user already exists
      const userRepository = this.repositoryFactory.getUserRepository();
      const existingUserByUsername = await userRepository.getByUsername(username);
      const existingUserByEmail = await userRepository.getByEmail(email);

      if (existingUserByUsername) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this username already exists'
          }
        });
        return;
      }

      if (existingUserByEmail) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
        return;
      }

      // Create user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser: Omit<User, 'user_id'> = {
        username,
        email,
        password: hashedPassword,
        name,
        role: UserRole.PLAYER, // Default role
        created_at: Date.now(),
        updated_at: Date.now()
      };

      const user = await userRepository.create(newUser);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while registering user'
        }
      });
    }
  }

  /**
   * Login user
   * @param req Request
   * @param res Response
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Get user
      const userRepository = this.repositoryFactory.getUserRepository();
      const user = await userRepository.getByUsername(username);

      if (!user || !user.password) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
        return;
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        config.jwt.secret as jwt.Secret,
        { expiresIn: config.jwt.accessExpiration as jwt.SignOptions['expiresIn'] }
      );

      const refreshToken = jwt.sign(
        { user_id: user.user_id },
        config.jwt.secret as jwt.Secret,
        { expiresIn: config.jwt.refreshExpiration as jwt.SignOptions['expiresIn'] }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens: {
            access: accessToken,
            refresh: refreshToken
          }
        }
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while logging in'
        }
      });
    }
  }

  /**
   * Refresh access token
   * @param req Request
   * @param res Response
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.secret);
      } catch (error) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        });
        return;
      }

      // Get user
      const userRepository = this.repositoryFactory.getUserRepository();
      const user = await userRepository.getById(decoded.user_id);

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        });
        return;
      }

      // Generate new tokens
      const accessToken = jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        config.jwt.secret as jwt.Secret,
        { expiresIn: config.jwt.accessExpiration as jwt.SignOptions['expiresIn'] }
      );

      const newRefreshToken = jwt.sign(
        { user_id: user.user_id },
        config.jwt.secret as jwt.Secret,
        { expiresIn: config.jwt.refreshExpiration as jwt.SignOptions['expiresIn'] }
      );

      res.status(200).json({
        success: true,
        data: {
          tokens: {
            access: accessToken,
            refresh: newRefreshToken
          }
        }
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while refreshing token'
        }
      });
    }
  }
}
