import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';
import { EventType } from '../models/event.model';

/**
 * Event routes
 * @param repositoryFactory Repository factory
 */
export function eventRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new EventController(repositoryFactory);

  /**
   * @swagger
   * /api/v1/events:
   *   get:
   *     summary: Get all events
   *     tags: [Events]
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
   *         name: session_id
   *         schema:
   *           type: string
   *         description: Filter by session ID
   *       - in: query
   *         name: event_type
   *         schema:
   *           type: string
   *           enum: [BATTLE, SOCIAL, EXPLORATION, DISCOVERY, QUEST, TRAVEL, REST, OTHER]
   *         description: Filter by event type
   *       - in: query
   *         name: location_id
   *         schema:
   *           type: string
   *         description: Filter by location ID
   *     responses:
   *       200:
   *         description: List of events
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
    checkPermission(Permission.VIEW_SESSIONS),
    [
      query('campaign_id')
        .notEmpty().withMessage('Campaign ID is required')
        .isUUID().withMessage('Invalid Campaign ID'),
      query('session_id')
        .optional()
        .isUUID().withMessage('Invalid Session ID'),
      query('event_type')
        .optional()
        .isIn(Object.values(EventType)).withMessage('Invalid Event Type'),
      query('location_id')
        .optional()
        .isUUID().withMessage('Invalid Location ID')
    ],
    controller.getAllEvents.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}:
   *   get:
   *     summary: Get event by ID
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     responses:
   *       200:
   *         description: Event details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_SESSIONS),
    param('id').isUUID().withMessage('Invalid Event ID'),
    controller.getEventById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events:
   *   post:
   *     summary: Create a new event
   *     tags: [Events]
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
   *               - event_type
   *             properties:
   *               campaign_id:
   *                 type: string
   *                 description: Campaign ID
   *               session_id:
   *                 type: string
   *                 description: Session ID
   *               name:
   *                 type: string
   *                 description: Event name
   *               description:
   *                 type: string
   *                 description: Event description
   *               event_type:
   *                 type: string
   *                 enum: [BATTLE, SOCIAL, EXPLORATION, DISCOVERY, QUEST, TRAVEL, REST, OTHER]
   *                 description: Event type
   *               event_date:
   *                 type: string
   *                 description: In-game date
   *               timeline_position:
   *                 type: number
   *                 description: Position in timeline
   *               location_id:
   *                 type: string
   *                 description: Location ID
   *     responses:
   *       201:
   *         description: Event created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Campaign, session, or location not found
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
      body('session_id')
        .optional()
        .isUUID().withMessage('Invalid Session ID'),
      body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('event_type')
        .notEmpty().withMessage('Event type is required')
        .isIn(Object.values(EventType)).withMessage('Invalid Event Type'),
      body('event_date')
        .optional()
        .isString().withMessage('Event date must be a string'),
      body('timeline_position')
        .optional()
        .isNumeric().withMessage('Timeline position must be a number'),
      body('location_id')
        .optional()
        .isUUID().withMessage('Invalid Location ID')
    ],
    controller.createEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}:
   *   put:
   *     summary: Update event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Event name
   *               description:
   *                 type: string
   *                 description: Event description
   *               event_type:
   *                 type: string
   *                 enum: [BATTLE, SOCIAL, EXPLORATION, DISCOVERY, QUEST, TRAVEL, REST, OTHER]
   *                 description: Event type
   *               event_date:
   *                 type: string
   *                 description: In-game date
   *               timeline_position:
   *                 type: number
   *                 description: Position in timeline
   *               session_id:
   *                 type: string
   *                 description: Session ID
   *               location_id:
   *                 type: string
   *                 description: Location ID
   *     responses:
   *       200:
   *         description: Event updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event, session, or location not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_SESSION),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('event_type')
        .optional()
        .isIn(Object.values(EventType)).withMessage('Invalid Event Type'),
      body('event_date')
        .optional()
        .isString().withMessage('Event date must be a string'),
      body('timeline_position')
        .optional()
        .isNumeric().withMessage('Timeline position must be a number'),
      body('session_id')
        .optional()
        .isUUID().withMessage('Invalid Session ID'),
      body('location_id')
        .optional()
        .isUUID().withMessage('Invalid Location ID')
    ],
    controller.updateEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}:
   *   delete:
   *     summary: Delete event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     responses:
   *       200:
   *         description: Event deleted
   *       400:
   *         description: Event has associated characters or items
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_SESSION),
    param('id').isUUID().withMessage('Invalid Event ID'),
    controller.deleteEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/characters:
   *   get:
   *     summary: Get characters in event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     responses:
   *       200:
   *         description: List of characters in event
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Event ID'),
    controller.getCharactersInEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/characters:
   *   post:
   *     summary: Add character to event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
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
   *               role:
   *                 type: string
   *                 description: Character role in event
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       201:
   *         description: Character added to event
   *       400:
   *         description: Validation error or character already in event
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event or character not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/characters',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      body('character_id')
        .notEmpty().withMessage('Character ID is required')
        .isUUID().withMessage('Invalid Character ID'),
      body('role')
        .optional()
        .isString().withMessage('Role must be a string'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.addCharacterToEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/characters/{characterId}:
   *   put:
   *     summary: Update event character
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
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
   *               role:
   *                 type: string
   *                 description: Character role in event
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       200:
   *         description: Event character updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event, character, or event character not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/characters/:characterId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      param('characterId').isUUID().withMessage('Invalid Character ID'),
      body('role')
        .optional()
        .isString().withMessage('Role must be a string'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.updateEventCharacter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/characters/{characterId}:
   *   delete:
   *     summary: Remove character from event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *       - in: path
   *         name: characterId
   *         required: true
   *         schema:
   *           type: string
   *         description: Character ID
   *     responses:
   *       200:
   *         description: Character removed from event
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event, character, or event character not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/characters/:characterId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      param('characterId').isUUID().withMessage('Invalid Character ID')
    ],
    controller.removeCharacterFromEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/items:
   *   get:
   *     summary: Get items in event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     responses:
   *       200:
   *         description: List of items in event
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/:id/items',
    authenticate,
    checkPermission(Permission.VIEW_CHARACTERS),
    param('id').isUUID().withMessage('Invalid Event ID'),
    controller.getItemsInEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/items:
   *   post:
   *     summary: Add item to event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - item_id
   *             properties:
   *               item_id:
   *                 type: string
   *                 description: Item ID
   *               role:
   *                 type: string
   *                 description: Item role in event
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       201:
   *         description: Item added to event
   *       400:
   *         description: Validation error or item already in event
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event or item not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/:id/items',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      body('item_id')
        .notEmpty().withMessage('Item ID is required')
        .isUUID().withMessage('Invalid Item ID'),
      body('role')
        .optional()
        .isString().withMessage('Role must be a string'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.addItemToEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/items/{itemId}:
   *   put:
   *     summary: Update event item
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *       - in: path
   *         name: itemId
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
   *               role:
   *                 type: string
   *                 description: Item role in event
   *               notes:
   *                 type: string
   *                 description: Notes
   *     responses:
   *       200:
   *         description: Event item updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event, item, or event item not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/items/:itemId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      param('itemId').isUUID().withMessage('Invalid Item ID'),
      body('role')
        .optional()
        .isString().withMessage('Role must be a string'),
      body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
    ],
    controller.updateEventItem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/items/{itemId}:
   *   delete:
   *     summary: Remove item from event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *         description: Item ID
   *     responses:
   *       200:
   *         description: Item removed from event
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event, item, or event item not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/:id/items/:itemId',
    authenticate,
    checkPermission(Permission.UPDATE_CHARACTER),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      param('itemId').isUUID().withMessage('Invalid Item ID')
    ],
    controller.removeItemFromEvent.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/campaigns/{campaignId}/timeline:
   *   get:
   *     summary: Get campaign timeline
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: campaignId
   *         required: true
   *         schema:
   *           type: string
   *         description: Campaign ID
   *     responses:
   *       200:
   *         description: Campaign timeline
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
    '/campaigns/:campaignId/timeline',
    authenticate,
    checkPermission(Permission.VIEW_SESSIONS),
    param('campaignId').isUUID().withMessage('Invalid Campaign ID'),
    controller.getCampaignTimeline.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/events/{id}/position:
   *   put:
   *     summary: Update event timeline position
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - timeline_position
   *             properties:
   *               timeline_position:
   *                 type: number
   *                 description: Position in timeline
   *     responses:
   *       200:
   *         description: Event timeline position updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.put(
    '/:id/position',
    authenticate,
    checkPermission(Permission.UPDATE_SESSION),
    [
      param('id').isUUID().withMessage('Invalid Event ID'),
      body('timeline_position')
        .notEmpty().withMessage('Timeline position is required')
        .isNumeric().withMessage('Timeline position must be a number')
    ],
    controller.updateEventTimelinePosition.bind(controller)
  );

  return router;
}
