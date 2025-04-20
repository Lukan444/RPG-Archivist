import { Router } from 'express';
import { CharacterController } from '../controllers/character.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';

/**
 * Character routes
 * @param repositoryFactory Repository factory
 */
export function characterRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new CharacterController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/characters:
   *   get:
   *     summary: Get all characters
   *     tags: [Characters]
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
   *         name: is_player_character
   *         schema:
   *           type: boolean
   *         description: Filter by player character status
   *       - in: query
   *         name: character_type
   *         schema:
   *           type: string
   *         description: Filter by character type
   *     responses:
   *       200:
   *         description: List of characters
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get(
    '/',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    controller.getAllCharacters.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}:
   *   get:
   *     summary: Get character by ID
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     responses:
   *       200:
   *         description: Character details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Character ID'),
    controller.getCharacterById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters:
   *   post:
   *     summary: Create a new character
   *     tags: [Characters]
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
   *                 description: Character name
   *               description:
   *                 type: string
   *                 description: Character description
   *               character_type:
   *                 type: string
   *                 description: Character type
   *               is_player_character:
   *                 type: boolean
   *                 description: Whether the character is a player character
   *               player_id:
   *                 type: string
   *                 description: Player ID (if is_player_character is true)
   *     responses:
   *       201:
   *         description: Character created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign or player not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/',
    authenticate,
    checkPermission(Permission.CREATE_CHARACTER),
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
      body('character_type')
        .optional()
        .isString().withMessage('Character type must be a string'),
      body('is_player_character')
        .optional()
        .isBoolean().withMessage('Is player character must be a boolean'),
      body('player_id')
        .optional()
        .isUUID().withMessage('Invalid Player ID')
    ],
    controller.createCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}:
   *   put:
   *     summary: Update character
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Character name
   *               description:
   *                 type: string
   *                 description: Character description
   *               character_type:
   *                 type: string
   *                 description: Character type
   *               is_player_character:
   *                 type: boolean
   *                 description: Whether the character is a player character
   *               player_id:
   *                 type: string
   *                 description: Player ID (if is_player_character is true)
   *     responses:
   *       200:
   *         description: Character updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character or player not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Character ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('character_type')
        .optional()
        .isString().withMessage('Character type must be a string'),
      body('is_player_character')
        .optional()
        .isBoolean().withMessage('Is player character must be a boolean'),
      body('player_id')
        .optional()
        .isUUID().withMessage('Invalid Player ID')
    ],
    controller.updateCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}:
   *   delete:
   *     summary: Delete character
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     responses:
   *       200:
   *         description: Character deleted
   *       400:
   *         description: Character has relationships
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_CHARACTER),
    param('id').isUUID().withMessage('Invalid Character ID'),
    controller.deleteCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}/relationships:
   *   get:
   *     summary: Get character relationships
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     responses:
   *       200:
   *         description: List of character relationships
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/relationships',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Character ID'),
    controller.getCharacterRelationships.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}/relationships:
   *   post:
   *     summary: Create a new character relationship
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - target_character_id
   *               - relationship_type
   *             properties:
   *               target_character_id:
   *                 type: string
   *                 description: Target character ID
   *               relationship_type:
   *                 type: string
   *                 description: Relationship type
   *               description:
   *                 type: string
   *                 description: Relationship description
   *     responses:
   *       201:
   *         description: Character relationship created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character or target character not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/relationships',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Character ID'),
      body('target_character_id')
        .notEmpty().withMessage('Target character ID is required')
        .isUUID().withMessage('Invalid Target Character ID'),
      body('relationship_type')
        .notEmpty().withMessage('Relationship type is required')
        .isString().withMessage('Relationship type must be a string'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string')
    ],
    controller.createCharacterRelationship.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}/relationships/{relationshipId}:
   *   put:
   *     summary: Update character relationship
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *       - in: path
   *         name: relationshipId
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
   *         description: Character relationship updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character or relationship not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/relationships/:relationshipId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Character ID'),
      param('relationshipId').isUUID().withMessage('Invalid Relationship ID'),
      body('relationship_type')
        .optional()
        .isString().withMessage('Relationship type must be a string'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string')
    ],
    controller.updateCharacterRelationship.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/characters/{id}/relationships/{relationshipId}:
   *   delete:
   *     summary: Delete character relationship
   *     tags: [Characters]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *       - in: path
   *         name: relationshipId
   *         required: true
   *         schema:
   *           type: string
   *         description: Relationship ID
   *     responses:
   *       200:
   *         description: Character relationship deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Character or relationship not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/relationships/:relationshipId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Character ID'),
      param('relationshipId').isUUID().withMessage('Invalid Relationship ID')
    ],
    controller.deleteCharacterRelationship.bind(controller)
  );

  return router;
}
