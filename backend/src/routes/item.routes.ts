import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';
import { ItemType, ItemRarity } from '../models/item.model';

/**
 * Item routes
 * @param repositoryFactory Repository factory
 */
export function itemRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new ItemController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/items:
   *   get:
   *     summary: Get all items
   *     tags: [Items]
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
   *         name: item_type
   *         schema:
   *           type: string
   *           enum: [WEAPON, ARMOR, POTION, SCROLL, WAND, RING, AMULET, TOOL, TREASURE, CLOTHING, CONTAINER, FOOD, MOUNT, VEHICLE, MISCELLANEOUS]
   *         description: Filter by item type
   *       - in: query
   *         name: rarity
   *         schema:
   *           type: string
   *           enum: [COMMON, UNCOMMON, RARE, VERY_RARE, LEGENDARY, ARTIFACT]
   *         description: Filter by item rarity
   *     responses:
   *       200:
   *         description: List of items
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
      query('item_type')
        .optional()
        .isIn(Object.values(ItemType)).withMessage('Invalid Item Type'),
      query('rarity')
        .optional()
        .isIn(Object.values(ItemRarity)).withMessage('Invalid Item Rarity')
    ],
    controller.getAllItems.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}:
   *   get:
   *     summary: Get item by ID
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     responses:
   *       200:
   *         description: Item details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Item ID'),
    controller.getItemById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items:
   *   post:
   *     summary: Create a new item
   *     tags: [Items]
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
   *               - item_type
   *             properties:
   *               campaign_id:
   *                 type: string
   *                 description: Campaign ID
   *               name:
   *                 type: string
   *                 description: Item name
   *               description:
   *                 type: string
   *                 description: Item description
   *               item_type:
   *                 type: string
   *                 enum: [WEAPON, ARMOR, POTION, SCROLL, WAND, RING, AMULET, TOOL, TREASURE, CLOTHING, CONTAINER, FOOD, MOUNT, VEHICLE, MISCELLANEOUS]
   *                 description: Item type
   *               rarity:
   *                 type: string
   *                 enum: [COMMON, UNCOMMON, RARE, VERY_RARE, LEGENDARY, ARTIFACT]
   *                 description: Item rarity
   *               value:
   *                 type: number
   *                 description: Item value
   *               weight:
   *                 type: number
   *                 description: Item weight
   *               properties:
   *                 type: string
   *                 description: Item properties
   *     responses:
   *       201:
   *         description: Item created
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
      body('item_type')
        .notEmpty().withMessage('Item type is required')
        .isIn(Object.values(ItemType)).withMessage('Invalid Item Type'),
      body('rarity')
        .optional()
        .isIn(Object.values(ItemRarity)).withMessage('Invalid Item Rarity'),
      body('value')
        .optional()
        .isNumeric().withMessage('Value must be a number'),
      body('weight')
        .optional()
        .isNumeric().withMessage('Weight must be a number'),
      body('properties')
        .optional()
        .isString().withMessage('Properties must be a string')
    ],
    controller.createItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}:
   *   put:
   *     summary: Update item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Item name
   *               description:
   *                 type: string
   *                 description: Item description
   *               item_type:
   *                 type: string
   *                 enum: [WEAPON, ARMOR, POTION, SCROLL, WAND, RING, AMULET, TOOL, TREASURE, CLOTHING, CONTAINER, FOOD, MOUNT, VEHICLE, MISCELLANEOUS]
   *                 description: Item type
   *               rarity:
   *                 type: string
   *                 enum: [COMMON, UNCOMMON, RARE, VERY_RARE, LEGENDARY, ARTIFACT]
   *                 description: Item rarity
   *               value:
   *                 type: number
   *                 description: Item value
   *               weight:
   *                 type: number
   *                 description: Item weight
   *               properties:
   *                 type: string
   *                 description: Item properties
   *     responses:
   *       200:
   *         description: Item updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('item_type')
        .optional()
        .isIn(Object.values(ItemType)).withMessage('Invalid Item Type'),
      body('rarity')
        .optional()
        .isIn(Object.values(ItemRarity)).withMessage('Invalid Item Rarity'),
      body('value')
        .optional()
        .isNumeric().withMessage('Value must be a number'),
      body('weight')
        .optional()
        .isNumeric().withMessage('Weight must be a number'),
      body('properties')
        .optional()
        .isString().withMessage('Properties must be a string')
    ],
    controller.updateItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}:
   *   delete:
   *     summary: Delete item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     responses:
   *       200:
   *         description: Item deleted
   *       400:
   *         description: Item has associated characters or locations
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_CHARACTER),
    param('id').isUUID().withMessage('Invalid Item ID'),
    controller.deleteItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/characters:
   *   get:
   *     summary: Get characters with item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     responses:
   *       200:
   *         description: List of characters with item
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Item ID'),
    controller.getCharactersWithItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/characters:
   *   post:
   *     summary: Add item to character
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
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
   *               quantity:
   *                 type: integer
   *                 description: Quantity
   *               notes:
   *                 type: string
   *                 description: Notes
   *               is_equipped:
   *                 type: boolean
   *                 description: Whether the item is equipped
   *     responses:
   *       201:
   *         description: Item added to character
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item or character not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      body('character_id')
        .notEmpty().withMessage('Character ID is required')
        .isUUID().withMessage('Invalid Character ID'),
      body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
      body('is_equipped')
        .optional()
        .isBoolean().withMessage('Is equipped must be a boolean')
    ],
    controller.addItemToCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/characters/{characterId}:
   *   put:
   *     summary: Update character item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
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
   *               quantity:
   *                 type: integer
   *                 description: Quantity
   *               notes:
   *                 type: string
   *                 description: Notes
   *               is_equipped:
   *                 type: boolean
   *                 description: Whether the item is equipped
   *     responses:
   *       200:
   *         description: Character item updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item, character, or character item not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/characters/:characterId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      param('characterId').isUUID().withMessage('Invalid Character ID'),
      body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
      body('is_equipped')
        .optional()
        .isBoolean().withMessage('Is equipped must be a boolean')
    ],
    controller.updateCharacterItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/characters/{characterId}:
   *   delete:
   *     summary: Remove item from character
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *       - in: path
   *         name: characterId
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     responses:
   *       200:
   *         description: Item removed from character
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item, character, or character item not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/characters/:characterId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      param('characterId').isUUID().withMessage('Invalid Character ID')
    ],
    controller.removeItemFromCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/locations:
   *   get:
   *     summary: Get locations with item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     responses:
   *       200:
   *         description: List of locations with item
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/locations',
    authenticate,
    checkPermission(Permission.VIEW_LOCATIONS),
    param('id').isUUID().withMessage('Invalid Item ID'),
    controller.getLocationsWithItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/locations:
   *   post:
   *     summary: Add item to location
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - location_id
   *             properties:
   *               location_id:
   *                 type: string
   *                 description: Location ID
   *               quantity:
   *                 type: integer
   *                 description: Quantity
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       201:
   *         description: Item added to location
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item or location not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/locations',
    authenticate,
    checkPermission(Permission.UPDATE_LOCATION),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      body('location_id')
        .notEmpty().withMessage('Location ID is required')
        .isUUID().withMessage('Invalid Location ID'),
      body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.addItemToLocation.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/locations/{locationId}:
   *   put:
   *     summary: Update location item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *       - in: path
   *         name: locationId
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
   *               quantity:
   *                 type: integer
   *                 description: Quantity
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       200:
   *         description: Location item updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item, location, or location item not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/locations/:locationId',
    authenticate,
    checkPermission(Permission.UPDATE_LOCATION),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      param('locationId').isUUID().withMessage('Invalid Location ID'),
      body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.updateLocationItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/items/{id}/locations/{locationId}:
   *   delete:
   *     summary: Remove item from location
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *       - in: path
   *         name: locationId
   *         required: true
   *         schema:
   *           type: string
   *         description: Location ID
   *     responses:
   *       200:
   *         description: Item removed from location
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item, location, or location item not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/locations/:locationId',
    authenticate,
    checkPermission(Permission.UPDATE_LOCATION),
    [
      param('id').isUUID().withMessage('Invalid Item ID'),
      param('locationId').isUUID().withMessage('Invalid Location ID')
    ],
    controller.removeItemFromLocation.bind(controller)
  );

  return router;
}
