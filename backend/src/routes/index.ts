import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { createUserRouter } from './user.routes';
import { rpgWorldRoutes } from './rpg-world.routes';
import { campaignRoutes } from './campaign.routes';
import { RepositoryFactory } from '../repositories/repository.factory';
import { DatabaseService } from '../services/database.service';

/**
 * Create API router
 */
export const createApiRouter = (): Router => {
  const router = Router();
  
  // Create repository factory
  const dbService = new DatabaseService();
  const repositoryFactory = new RepositoryFactory(dbService);

  // Mount routes
  router.use('/auth', createAuthRouter());
  router.use('/users', createUserRouter());
  router.use('/rpg-worlds', rpgWorldRoutes(repositoryFactory));
  router.use('/campaigns', campaignRoutes(repositoryFactory));

  return router;
};
