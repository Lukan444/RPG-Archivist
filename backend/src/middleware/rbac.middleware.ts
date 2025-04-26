import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Permission, ROLE_PERMISSIONS } from '../models/permission.model';
import { UserRole } from '../models/user.model';

/**
 * Check if user has permission
 * @param permission Permission to check
 */
export const checkPermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user from request
      const user = (req as AuthRequest).user;

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }

      // Check if user has permission
      const userRole = user.role as UserRole;
      const permissions = ROLE_PERMISSIONS[userRole];

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Forbidden'
          }
        });
      }

      // User has permission, continue
      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while checking permission'
        }
      });
    }
  };
};
