import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';

/**
 * Location routes
 * @param repositoryFactory Repository factory
 */
export function locationRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new LocationController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/locations:
   *   get:
   *     summary: Get all locations
   *     tags: [Locations]
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
   *       - in: query
   *         name: location_type
   *         schema:
   *           type: string
   *         description: Filter by location type
   *       - in: query
   *         name: parent_location_id
   *         schema:
   *           type: string
   *         description: Filter by parent location ID
   *     responses:
   *       200:
   *         description: List of locations
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get(
    '/',
    authenticate,
    checkPermission(Permission.VIEW_LOCATIONS),
    controller.getAllLocations.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/locations/{id}:
   *   get:
   *     summary: Get location by ID
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Location ID
   *     responses:
   *       200:
   *         description: Location details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Location not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_LOCATIONS),
    param('id').isUUID().withMessage('Invalid Location ID'),
    controller.getLocationById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/locations:
   *   post:
   *     summary: Create a new location
   *     tags: [Locations]
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
   *                 description: Location name
   *               description:
   *                 type: string
   *                 description: Location description
   *               location_type:
   *                 type: string
   *                 description: Location type
   *               parent_location_id:
   *                 type: string
   *                 description: Parent location ID
   *     responses:
   *       201:
   *         description: Location created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign or parent location not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/',
    authenticate,
    checkPermission(Permission.CREATE_LOCATION),
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
      body('location_type')
        .optional()
        .isString().withMessage('Location type must be a string'),
      body('parent_location_id')
        .optional()
        .isUUID().withMessage('Invalid Parent Location ID')
    ],
    controller.createLocation.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/locations/{id}:
   *   put:
   *     summary: Update location
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Location ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Location name
   *               description:
   *                 type: string
   *                 description: Location description
   *               location_type:
   *                 type: string
   *                 description: Location type
   *               parent_location_id:
   *                 type: string
   *                 description: Parent location ID
   *     responses:
   *       200:
   *         description: Location updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Location or parent location not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_LOCATION),
    [
      param('id').isUUID().withMessage('Invalid Location ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('location_type')
        .optional()
        .isString().withMessage('Location type must be a string'),
      body('parent_location_id')
        .optional()
        .isUUID().withMessage('Invalid Parent Location ID')
    ],
    controller.updateLocation.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/locations/{id}:
   *   delete:
   *     summary: Delete location
   *     tags: [Locations]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Location ID
   *     responses:
   *       200:
   *         description: Location deleted
   *       400:
   *         description: Location has children or relationships
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Location not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_LOCATION),
    param('id').isUUID().withMessage('Invalid Location ID'),
    controller.deleteLocation.bind(controller)
  );

  return router;
}
