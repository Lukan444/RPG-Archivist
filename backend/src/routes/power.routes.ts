import { Router } from 'express';
import { PowerController } from '../controllers/power.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';
import { PowerType } from '../models/power.model';

/**
 * Power routes
 * @param repositoryFactory Repository factory
 */
export function powerRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new PowerController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/powers:
   *   get:
   *     summary: Get all powers
   *     tags: [Powers]
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
   *         required: true
   *         description: Campaign ID
   *       - in: query
   *         name: power_type
   *         schema:
   *           type: string
   *           enum: [SKILL, ABILITY, SPELL, FEAT, TRAIT, OTHER]
   *         description: Filter by power type
   *     responses:
   *       200:
   *         description: List of powers
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
      query('power_type')
        .optional()
        .isIn(Object.values(PowerType)).withMessage('Invalid Power Type')
    ],
    controller.getAllPowers.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}:
   *   get:
   *     summary: Get power by ID
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *     responses:
   *       200:
   *         description: Power details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Power ID'),
    controller.getPowerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers:
   *   post:
   *     summary: Create a new power
   *     tags: [Powers]
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
   *               - power_type
   *             properties:
   *               campaign_id:
   *                 type: string
   *                 description: Campaign ID
   *               name:
   *                 type: string
   *                 description: Power name
   *               description:
   *                 type: string
   *                 description: Power description
   *               power_type:
   *                 type: string
   *                 enum: [SKILL, ABILITY, SPELL, FEAT, TRAIT, OTHER]
   *                 description: Power type
   *               effect:
   *                 type: string
   *                 description: Power effect
   *               requirements:
   *                 type: string
   *                 description: Power requirements
   *     responses:
   *       201:
   *         description: Power created
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
      body('power_type')
        .notEmpty().withMessage('Power type is required')
        .isIn(Object.values(PowerType)).withMessage('Invalid Power Type'),
      body('effect')
        .optional()
        .isString().withMessage('Effect must be a string'),
      body('requirements')
        .optional()
        .isString().withMessage('Requirements must be a string')
    ],
    controller.createPower.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}:
   *   put:
   *     summary: Update power
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Power name
   *               description:
   *                 type: string
   *                 description: Power description
   *               power_type:
   *                 type: string
   *                 enum: [SKILL, ABILITY, SPELL, FEAT, TRAIT, OTHER]
   *                 description: Power type
   *               effect:
   *                 type: string
   *                 description: Power effect
   *               requirements:
   *                 type: string
   *                 description: Power requirements
   *     responses:
   *       200:
   *         description: Power updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Power ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('power_type')
        .optional()
        .isIn(Object.values(PowerType)).withMessage('Invalid Power Type'),
      body('effect')
        .optional()
        .isString().withMessage('Effect must be a string'),
      body('requirements')
        .optional()
        .isString().withMessage('Requirements must be a string')
    ],
    controller.updatePower.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}:
   *   delete:
   *     summary: Delete power
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *     responses:
   *       200:
   *         description: Power deleted
   *       400:
   *         description: Power has associated characters
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_CHARACTER),
    param('id').isUUID().withMessage('Invalid Power ID'),
    controller.deletePower.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}/characters:
   *   get:
   *     summary: Get characters with power
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *     responses:
   *       200:
   *         description: List of characters with power
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Power ID'),
    controller.getCharactersWithPower.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}/characters:
   *   post:
   *     summary: Add power to character
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - character_id
   *             properties:
   *               character_id:
   *                 type: string
   *                 description: Character ID
   *               proficiency_level:
   *                 type: integer
   *                 description: Proficiency level
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       201:
   *         description: Power added to character
   *       400:
   *         description: Validation error or character already has power
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power or character not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Power ID'),
      body('character_id')
        .notEmpty().withMessage('Character ID is required')
        .isUUID().withMessage('Invalid Character ID'),
      body('proficiency_level')
        .optional()
        .isInt({ min: 0 }).withMessage('Proficiency level must be a non-negative integer'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.addPowerToCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}/characters/{characterId}:
   *   put:
   *     summary: Update character power
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *       - in: path
   *         name: characterId
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
   *               proficiency_level:
   *                 type: integer
   *                 description: Proficiency level
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       200:
   *         description: Character power updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power, character, or character power not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/characters/:characterId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Power ID'),
      param('characterId').isUUID().withMessage('Invalid Character ID'),
      body('proficiency_level')
        .optional()
        .isInt({ min: 0 }).withMessage('Proficiency level must be a non-negative integer'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.updateCharacterPower.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/powers/{id}/characters/{characterId}:
   *   delete:
   *     summary: Remove power from character
   *     tags: [Powers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Power ID
   *       - in: path
   *         name: characterId
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     responses:
   *       200:
   *         description: Power removed from character
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Power, character, or character power not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/characters/:characterId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Power ID'),
      param('characterId').isUUID().withMessage('Invalid Character ID')
    ],
    controller.removePowerFromCharacter.bind(controller)
  );

  return router;
}
