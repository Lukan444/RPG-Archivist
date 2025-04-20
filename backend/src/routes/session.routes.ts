import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';

/**
 * Session routes
 * @param repositoryFactory Repository factory
 */
export function sessionRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new SessionController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/sessions:
   *   get:
   *     summary: Get all sessions
   *     tags: [Sessions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of items per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term
   *       - in: query
   *         name: campaign_id
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: List of sessions
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get(
    '/',
    authenticate,
    checkPermission(Permission.VIEW_SESSIONS),
    controller.getAllSessions.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/sessions/{id}:
   *   get:
   *     summary: Get session by ID
   *     tags: [Sessions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Session ID
   *     responses:
   *       200:
   *         description: Session details
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Session not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_SESSIONS),
    param('id').isUUID().withMessage('Invalid Session ID'),
    controller.getSessionById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/sessions:
   *   post:
   *     summary: Create a new session
   *     tags: [Sessions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - campaign_id
   *               - name
   *             properties:
   *               campaign_id:
   *                 type: string
   *                 description: Campaign ID
   *               name:
   *                 type: string
   *                 description: Session name
   *               description:
   *                 type: string
   *                 description: Session description
   *               number:
   *                 type: integer
   *                 description: Session number
   *               date:
   *                 type: string
   *                 format: date-time
   *                 description: Session date
   *               duration_minutes:
   *                 type: integer
   *                 description: Session duration in minutes
   *               is_completed:
   *                 type: boolean
   *                 description: Whether the session is completed
   *     responses:
   *       201:
   *         description: Session created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/',
    authenticate,
    checkPermission(Permission.CREATE_SESSION),
    [
      body('campaign_id')
        .notEmpty().withMessage('Campaign ID is required')
        .isUUID().withMessage('Invalid Campaign ID'),
      body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('number')
        .optional()
        .isInt({ min: 1 }).withMessage('Number must be a positive integer'),
      body('date')
        .optional()
        .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
      body('duration_minutes')
        .optional()
        .isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
      body('is_completed')
        .optional()
        .isBoolean().withMessage('Is completed must be a boolean')
    ],
    controller.createSession.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/sessions/{id}:
   *   put:
   *     summary: Update session
   *     tags: [Sessions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Session name
   *               description:
   *                 type: string
   *                 description: Session description
   *               number:
   *                 type: integer
   *                 description: Session number
   *               date:
   *                 type: string
   *                 format: date-time
   *                 description: Session date
   *               duration_minutes:
   *                 type: integer
   *                 description: Session duration in minutes
   *               is_completed:
   *                 type: boolean
   *                 description: Whether the session is completed
   *     responses:
   *       200:
   *         description: Session updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Session not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_SESSION),
    [
      param('id').isUUID().withMessage('Invalid Session ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('number')
        .optional()
        .isInt({ min: 1 }).withMessage('Number must be a positive integer'),
      body('date')
        .optional()
        .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
      body('duration_minutes')
        .optional()
        .isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
      body('is_completed')
        .optional()
        .isBoolean().withMessage('Is completed must be a boolean')
    ],
    controller.updateSession.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/sessions/{id}:
   *   delete:
   *     summary: Delete session
   *     tags: [Sessions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Session ID
   *     responses:
   *       200:
   *         description: Session deleted
   *       400:
   *         description: Session has transcriptions
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Session not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_SESSION),
    param('id').isUUID().withMessage('Invalid Session ID'),
    controller.deleteSession.bind(controller)
  );

  return router;
}
