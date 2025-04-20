import { Router } from 'express';
import { RPGWorldController } from '../controllers/rpg-world.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../models/permission.model';

/**
 * RPG World routes
 * @param repositoryFactory Repository factory
 */
export function rpgWorldRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  const controller = new RPGWorldController(repositoryFactory);

  // Get all RPG Worlds
  router.get(
    '/',
    authenticate,
    checkPermission(Permission.VIEW_RPG_WORLDS),
    controller.getAllRPGWorlds.bind(controller)
  );

  // Get RPG World by ID
  router.get(
    '/:id',
    authenticate,
    checkPermission(Permission.VIEW_RPG_WORLDS),
    param('id').isUUID().withMessage('Invalid RPG World ID'),
    controller.getRPGWorldById.bind(controller)
  );

  // Create RPG World
  router.post(
    '/',
    authenticate,
    checkPermission(Permission.CREATE_RPG_WORLD),
    [
      body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),
      body('system_version')
        .optional()
        .isString().withMessage('System version must be a string')
    ],
    controller.createRPGWorld.bind(controller)
  );

  // Update RPG World
  router.put(
    '/:id',
    authenticate,
    checkPermission(Permission.UPDATE_RPG_WORLD),
    [
      param('id').isUUID().withMessage('Invalid RPG World ID'),
      body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
      body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
      body('system_version')
        .optional()
        .isString().withMessage('System version must be a string')
    ],
    controller.updateRPGWorld.bind(controller)
  );

  // Delete RPG World
  router.delete(
    '/:id',
    authenticate,
    checkPermission(Permission.DELETE_RPG_WORLD),
    param('id').isUUID().withMessage('Invalid RPG World ID'),
    controller.deleteRPGWorld.bind(controller)
  );

  // Get campaigns for RPG World
  router.get(
    '/:id/campaigns',
    authenticate,
    checkPermission(Permission.VIEW_CAMPAIGNS),
    param('id').isUUID().withMessage('Invalid RPG World ID'),
    controller.getCampaignsForRPGWorld.bind(controller)
  );

  return router;
}
