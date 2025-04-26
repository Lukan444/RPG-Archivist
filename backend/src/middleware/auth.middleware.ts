import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/user.model';
import config from '../config';

/**
 * Extended request with user data
 */
export interface AuthRequest extends Request {
  user?: User;
}

/**
 * Authenticate user middleware
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // For development, bypass authentication
    // This is a temporary solution for development purposes only
    // In a production environment, proper authentication should be implemented
    (req as AuthRequest).user = {
      user_id: '00000000-0000-0000-0000-000000000000',
      username: 'dev_user',
      email: 'dev@example.com',
      role: UserRole.ADMIN,
      name: 'Development User'
    };

    next();
    return;

    // The code below is commented out for development purposes
    /*
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Add user to request
    (req as AuthRequest).user = {
      user_id: decoded.user_id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
    */
  } catch (error) {
    console.error('Authentication error:', error);
    if (res && res.status) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    } else {
      console.error('Response object is undefined or missing status method');
    }
  }
}

/**
 * Authentication middleware class
 */
export class AuthMiddleware {
  constructor() {
    // No initialization needed for now
  }
  /**
   * Authenticate user middleware
   * @param req Request
   * @param res Response
   * @param next Next function
   */
  authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      // For development, bypass authentication
      // This is a temporary solution for development purposes only
      // In a production environment, proper authentication should be implemented
      (req as AuthRequest).user = {
        user_id: '00000000-0000-0000-0000-000000000000',
        username: 'dev_user',
        email: 'dev@example.com',
        role: UserRole.ADMIN,
        name: 'Development User'
      };

      next();
      return;

      // The code below is commented out for development purposes
      /*
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // Add user to request
      (req as AuthRequest).user = {
        user_id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };

      next();
      */
    } catch (error) {
      console.error('Authentication error:', error);
      if (res && res.status) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        });
      } else {
        console.error('Response object is undefined or missing status method');
      }
    }
  }

  /**
   * Check if user has required role
   * @param roles Required roles
   * @returns Middleware function
   */
  hasRole(roles: UserRole | UserRole[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      const authReq = req as AuthRequest;

      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const userRole = authReq.user.role;

      if (!userRole) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          }
        });
        return;
      }

      // Check if user has required role
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      if (!requiredRoles.includes(userRole as UserRole)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          }
        });
        return;
      }

      next();
    };
  }
}
