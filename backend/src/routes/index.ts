import { Router } from 'express';
import { createAuthRouter } from './auth.routes';
import { createUserRouter } from './user.routes';
import { rpgWorldRoutes } from './rpg-world.routes';
import { campaignRoutes } from './campaign.routes';
import { sessionRoutes } from './session.routes';
import { characterRoutes } from './character.routes';
import { locationRoutes } from './location.routes';
import { relationshipRoutes } from './relationship.routes';
import { powerRoutes } from './power.routes';
import { itemRoutes } from './item.routes';
import { eventRoutes } from './event.routes';
import { RepositoryFactory } from '../repositories/repository.factory';
import { DatabaseService } from '../services/database.service';

/**
 * Create API router
 * @param dbService Database service
 */
export function createApiRouter(dbService: DatabaseService): Router {
  const router = Router();
  const repositoryFactory = new RepositoryFactory(dbService);

  // Mount routes
  router.use('/auth', createAuthRouter());
  router.use('/users', createUserRouter());
  router.use('/rpg-worlds', rpgWorldRoutes(repositoryFactory));
  router.use('/campaigns', campaignRoutes(repositoryFactory));
  router.use('/sessions', sessionRoutes(repositoryFactory));
  router.use('/characters', characterRoutes(repositoryFactory));
  router.use('/locations', locationRoutes(repositoryFactory));
  router.use('/relationships', relationshipRoutes(repositoryFactory));
  router.use('/powers', powerRoutes(repositoryFactory));
  router.use('/items', itemRoutes(repositoryFactory));
  router.use('/events', eventRoutes(repositoryFactory));

  return router;
}
