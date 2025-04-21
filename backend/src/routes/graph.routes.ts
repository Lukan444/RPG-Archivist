import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller';
import { GraphService } from '../services/graph.service';
import { RepositoryFactory } from '../repositories/repository.factory';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Create graph routes
 * @param repositoryFactory Repository factory
 * @returns Router
 */
export const graphRoutes = (repositoryFactory: RepositoryFactory) => {
  const router = Router();

  // Create graph repository
  const graphRepository = repositoryFactory.getGraphRepository();

  // Create graph service
  const graphService = new GraphService(graphRepository);

  // Create graph controller
  const graphController = new GraphController(graphService);

  // Routes
  router.get('/', authenticate(), graphController.getGraphData);
  router.get('/mind-map', authenticate(), graphController.getMindMapGraph);
  router.get('/hierarchy', authenticate(), graphController.getHierarchyGraph);

  return router;
};
