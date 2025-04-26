import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole } from '../models/user.model';

/**
 * Admin only middleware
 * @returns Middleware function
 */
export function adminOnly() {
  return (req: Request, res: Response, next: NextFunction) => {
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

    if (authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is an admin
 */
export class AdminMiddleware {
  /**
   * Check if user is an admin
   * @param req Request
   * @param res Response
   * @param next Next function
   */
  isAdmin(req: Request, res: Response, next: NextFunction): void {
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

    if (authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });
      return;
    }

    next();
  }

  /**
   * Check if user is an admin or game master
   * @param req Request
   * @param res Response
   * @param next Next function
   */
  isAdminOrGameMaster(req: Request, res: Response, next: NextFunction): void {
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

    if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.GAME_MASTER) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin or Game Master access required'
        }
      });
      return;
    }

    next();
  }
}
