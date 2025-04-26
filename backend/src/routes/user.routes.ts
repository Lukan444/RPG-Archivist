import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { RepositoryFactory } from '../repositories/repository.factory';
import { DatabaseService } from '../services/database.service';

/**
 * User routes
 * @param repositoryFactory Repository factory
 */
export const userRouter = (repositoryFactory: RepositoryFactory): Router => {
  const router = Router();

  /**
   * @swagger
   * /users/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     user_id:
   *                       type: string
   *                       example: 123e4567-e89b-12d3-a456-426614174000
   *                     username:
   *                       type: string
   *                       example: johndoe
   *                     email:
   *                       type: string
   *                       example: john.doe@example.com
   *                     role:
   *                       type: string
   *                       example: PLAYER
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid or expired token
   */
  router.get('/profile', authenticate, (req: AuthRequest, res) => {
    res.status(200).json({ user: req.user });
  });

  /**
   * @swagger
   * /users/admin:
   *   get:
   *     summary: Admin only endpoint
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Admin access granted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Admin access granted
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid or expired token
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Insufficient permissions
   */
  router.get(
    '/admin',
    authenticate,
    (req, res) => {
      res.status(200).json({ message: 'Admin access granted' });
    }
  );

  /**
   * @swagger
   * /users/game-master:
   *   get:
   *     summary: Game master or admin endpoint
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Game master access granted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Game master access granted
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid or expired token
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Insufficient permissions
   */
  router.get(
    '/game-master',
    authenticate,
    (req, res) => {
      res.status(200).json({ message: 'Game master access granted' });
    }
  );

  return router;
};

/**
 * Create user router
 */
export const createUserRouter = (): Router => {
  const dbService = new DatabaseService();
  const repositoryFactory = new RepositoryFactory(dbService);
  return userRouter(repositoryFactory);
};
