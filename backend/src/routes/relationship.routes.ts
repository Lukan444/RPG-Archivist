import { Router } from 'express';
import { RelationshipController } from '../controllers/relationship.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';
import { EntityType } from '../models/relationship.model';

/**
 * Relationship routes
 * @param repositoryFactory Repository factory
 */
export function relationshipRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new RelationshipController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/relationships:
   *   get:
   *     summary: Get all relationships
   *     tags: [Relationships]
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
   *         name: campaign_id
   *         schema:
   *           type: string
   *         required: true
   *         description: Campaign ID
   *       - in: query
   *         name: source_entity_id
   *         schema:
   *           type: string
   *         description: Source entity ID
   *       - in: query
   *         name: source_entity_type
   *         schema:
   *           type: string
   *           enum: [CHARACTER, LOCATION, EVENT, ITEM]
   *         description: Source entity type
   *       - in: query
   *         name: target_entity_id
   *         schema:
   *           type: string
   *         description: Target entity ID
   *       - in: query
   *         name: target_entity_type
   *         schema:
   *           type: string
   *           enum: [CHARACTER, LOCATION, EVENT, ITEM]
   *         description: Target entity type
   *       - in: query
   *         name: relationship_type
   *         schema:
   *           type: string
   *         description: Relationship type
   *       - in: query
   *         name: entity_id
   *         schema:
   *           type: string
   *         description: Entity ID (source or target)
   *       - in: query
   *         name: entity_type
   *         schema:
   *           type: string
   *           enum: [CHARACTER, LOCATION, EVENT, ITEM]
   *         description: Entity type (source or target)
   *     responses:
   *       200:
   *         description: List of relationships
   *       400:
   *         description: Campaign ID is required
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.get(
    '/',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    [
      query('campaign_id')
        .notEmpty().withMessage('Campaign ID is required')
        .isUUID().withMessage('Invalid Campaign ID'),
      query('source_entity_id')
        .optional()
        .isUUID().withMessage('Invalid Source Entity ID'),
      query('source_entity_type')
        .optional()
        .isIn(Object.values(EntityType)).withMessage('Invalid Source Entity Type'),
      query('target_entity_id')
        .optional()
        .isUUID().withMessage('Invalid Target Entity ID'),
      query('target_entity_type')
        .optional()
        .isIn(Object.values(EntityType)).withMessage('Invalid Target Entity Type'),
      query('entity_id')
        .optional()
        .isUUID().withMessage('Invalid Entity ID'),
      query('entity_type')
        .optional()
        .isIn(Object.values(EntityType)).withMessage('Invalid Entity Type')
    ],
    controller.getAllRelationships.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/relationships/{id}:
   *   get:
   *     summary: Get relationship by ID
   *     tags: [Relationships]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Relationship ID
   *     responses:
   *       200:
   *         description: Relationship details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Relationship not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Relationship ID'),
    controller.getRelationshipById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/relationships:
   *   post:
   *     summary: Create a new relationship
   *     tags: [Relationships]
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
   *               - source_entity_id
   *               - source_entity_type
   *               - target_entity_id
   *               - target_entity_type
   *               - relationship_type
   *             properties:
   *               campaign_id:
   *                 type: string
   *                 description: Campaign ID
   *               source_entity_id:
   *                 type: string
   *                 description: Source entity ID
   *               source_entity_type:
   *                 type: string
   *                 enum: [CHARACTER, LOCATION, EVENT, ITEM]
   *                 description: Source entity type
   *               target_entity_id:
   *                 type: string
   *                 description: Target entity ID
   *               target_entity_type:
   *                 type: string
   *                 enum: [CHARACTER, LOCATION, EVENT, ITEM]
   *                 description: Target entity type
   *               relationship_type:
   *                 type: string
   *                 description: Relationship type
   *               description:
   *                 type: string
   *                 description: Relationship description
   *     responses:
   *       201:
   *         description: Relationship created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign, source entity, or target entity not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      body('campaign_id')
        .notEmpty().withMessage('Campaign ID is required')
        .isUUID().withMessage('Invalid Campaign ID'),
      body('source_entity_id')
        .notEmpty().withMessage('Source entity ID is required')
        .isUUID().withMessage('Invalid Source Entity ID'),
      body('source_entity_type')
        .notEmpty().withMessage('Source entity type is required')
        .isIn(Object.values(EntityType)).withMessage('Invalid Source Entity Type'),
      body('target_entity_id')
        .notEmpty().withMessage('Target entity ID is required')
        .isUUID().withMessage('Invalid Target Entity ID'),
      body('target_entity_type')
        .notEmpty().withMessage('Target entity type is required')
        .isIn(Object.values(EntityType)).withMessage('Invalid Target Entity Type'),
      body('relationship_type')
        .notEmpty().withMessage('Relationship type is required')
        .isString().withMessage('Relationship type must be a string'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string')
    ],
    controller.createRelationship.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/relationships/{id}:
   *   put:
   *     summary: Update relationship
   *     tags: [Relationships]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Relationship ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               relationship_type:
   *                 type: string
   *                 description: Relationship type
   *               description:
   *                 type: string
   *                 description: Relationship description
   *     responses:
   *       200:
   *         description: Relationship updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Relationship not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Relationship ID'),
      body('relationship_type')
        .optional()
        .isString().withMessage('Relationship type must be a string'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string')
    ],
    controller.updateRelationship.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/relationships/{id}:
   *   delete:
   *     summary: Delete relationship
   *     tags: [Relationships]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Relationship ID
   *     responses:
   *       200:
   *         description: Relationship deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Relationship not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    param('id').isUUID().withMessage('Invalid Relationship ID'),
    controller.deleteRelationship.bind(controller)
  );

  return router;
}
