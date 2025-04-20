import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';
import { CampaignUserRelationshipType } from '../models/campaign.model';

/**
 * Campaign routes
 * @param repositoryFactory Repository factory
 */
export function campaignRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new CampaignController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/campaigns:
   *   get:
   *     summary: Get all campaigns
   *     tags: [Campaigns]
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
   *         name: rpg_world_id
   *         schema:
   *           type: string
   *         description: RPG World ID
   *       - in: query
   *         name: user_id
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: List of campaigns
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get(
    '/',
    authenticate,
    checkPermission(Permission.VIEW_CAMPAIGNS),
    controller.getAllCampaigns.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}:
   *   get:
   *     summary: Get campaign by ID
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: Campaign details
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_CAMPAIGNS),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns:
   *   post:
   *     summary: Create a new campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - rpg_world_id
   *             properties:
   *               name:
   *                 type: string
   *                 description: Campaign name
   *               description:
   *                 type: string
   *                 description: Campaign description
   *               rpg_world_id:
   *                 type: string
   *                 description: RPG World ID
   *               start_date:
   *                 type: string
   *                 format: date-time
   *                 description: Campaign start date
   *               is_active:
   *                 type: boolean
   *                 description: Whether the campaign is active
   *     responses:
   *       201:
   *         description: Campaign created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: RPG World not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/',
    authenticate,
    checkPermission(Permission.CREATE_CAMPAIGN),
    [
      body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),
      body('rpg_world_id')
        .notEmpty().withMessage('RPG World ID is required')
        .isUUID().withMessage('Invalid RPG World ID'),
      body('start_date')
        .optional()
        .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
      body('is_active')
        .optional()
        .isBoolean().withMessage('Is active must be a boolean')
    ],
    controller.createCampaign.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}:
   *   put:
   *     summary: Update campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Campaign name
   *               description:
   *                 type: string
   *                 description: Campaign description
   *               rpg_world_id:
   *                 type: string
   *                 description: RPG World ID
   *               start_date:
   *                 type: string
   *                 format: date-time
   *                 description: Campaign start date
   *               end_date:
   *                 type: string
   *                 format: date-time
   *                 description: Campaign end date
   *               is_active:
   *                 type: boolean
   *                 description: Whether the campaign is active
   *     responses:
   *       200:
   *         description: Campaign updated
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
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_CAMPAIGN),
    [
      param('id').isUUID().withMessage('Invalid Campaign ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('rpg_world_id')
        .optional()
        .isUUID().withMessage('Invalid RPG World ID'),
      body('start_date')
        .optional()
        .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
      body('end_date')
        .optional()
        .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
      body('is_active')
        .optional()
        .isBoolean().withMessage('Is active must be a boolean')
    ],
    controller.updateCampaign.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}:
   *   delete:
   *     summary: Delete campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: Campaign deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_CAMPAIGN),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.deleteCampaign.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/users:
   *   get:
   *     summary: Get users for campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: List of users
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/users',
    authenticate,
    checkPermission(Permission.VIEW_CAMPAIGNS),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignUsers.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/users:
   *   post:
   *     summary: Add user to campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - user_id
   *               - relationship_type
   *             properties:
   *               user_id:
   *                 type: string
   *                 description: User ID
   *               relationship_type:
   *                 type: string
   *                 enum: [OWNER, GAME_MASTER, PLAYER, VIEWER]
   *                 description: Relationship type
   *     responses:
   *       200:
   *         description: User added to campaign
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign or user not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/users',
    authenticate,
    checkPermission(Permission.UPDATE_CAMPAIGN),
    [
      param('id').isUUID().withMessage('Invalid Campaign ID'),
      body('user_id')
        .notEmpty().withMessage('User ID is required')
        .isUUID().withMessage('Invalid User ID'),
      body('relationship_type')
        .notEmpty().withMessage('Relationship type is required')
        .isIn(Object.values(CampaignUserRelationshipType)).withMessage('Invalid relationship type')
    ],
    controller.addUserToCampaign.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/users/{userId}:
   *   delete:
   *     summary: Remove user from campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User removed from campaign
   *       400:
   *         description: Cannot remove the only owner
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign or user not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/users/:userId',
    authenticate,
    checkPermission(Permission.UPDATE_CAMPAIGN),
    [
      param('id').isUUID().withMessage('Invalid Campaign ID'),
      param('userId').isUUID().withMessage('Invalid User ID')
    ],
    controller.removeUserFromCampaign.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/users/{userId}/role:
   *   put:
   *     summary: Update user role in campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - relationship_type
   *             properties:
   *               relationship_type:
   *                 type: string
   *                 enum: [OWNER, GAME_MASTER, PLAYER, VIEWER]
   *                 description: Relationship type
   *     responses:
   *       200:
   *         description: User role updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign or user not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/users/:userId/role',
    authenticate,
    checkPermission(Permission.UPDATE_CAMPAIGN),
    [
      param('id').isUUID().withMessage('Invalid Campaign ID'),
      param('userId').isUUID().withMessage('Invalid User ID'),
      body('relationship_type')
        .notEmpty().withMessage('Relationship type is required')
        .isIn(Object.values(CampaignUserRelationshipType)).withMessage('Invalid relationship type')
    ],
    controller.updateUserRoleInCampaign.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/sessions:
   *   get:
   *     summary: Get sessions for campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: List of sessions
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/sessions',
    authenticate,
    checkPermission(Permission.VIEW_SESSIONS),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignSessions.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/characters:
   *   get:
   *     summary: Get characters for campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: List of characters
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignCharacters.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/locations:
   *   get:
   *     summary: Get locations for campaign
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: List of locations
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/locations',
    authenticate,
    checkPermission(Permission.VIEW_LOCATIONS),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignLocations.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{id}/statistics:
   *   get:
   *     summary: Get campaign statistics
   *     tags: [Campaigns]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: Campaign statistics
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/statistics',
    authenticate,
    checkPermission(Permission.VIEW_CAMPAIGNS),
    param('id').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignStatistics.bind(controller)
  );

  return router;
}
