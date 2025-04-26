import { Router } from 'express';
import { SessionAnalysisController } from '../controllers/session-analysis.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { SessionAnalysisService } from '../services/session-analysis.service';
import { AuthMiddleware } from '../middleware/auth.middleware';

/**
 * Create session analysis routes
 * @param repositoryFactory Repository factory
 * @returns Router
 */
export function sessionAnalysisRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();

  // Create service
  const sessionAnalysisService = new SessionAnalysisService(
    repositoryFactory.getSessionAnalysisRepository(),
    repositoryFactory.getTranscriptionRepository(),
    repositoryFactory.getSessionRepository(),
    repositoryFactory.getCharacterRepository(),
    repositoryFactory.getAudioRecordingRepository()
  );

  // Create controller
  const sessionAnalysisController = new SessionAnalysisController(sessionAnalysisService);

  // Create auth middleware
  const authMiddleware = new AuthMiddleware();

  // Routes
  router.get('/:id', authMiddleware.authenticate.bind(authMiddleware), sessionAnalysisController.getById);
  router.get('/session/:sessionId', authMiddleware.authenticate.bind(authMiddleware), sessionAnalysisController.getBySessionId);
  router.get('/transcription/:transcriptionId', authMiddleware.authenticate.bind(authMiddleware), sessionAnalysisController.getByTranscriptionId);
  router.post('/', authMiddleware.authenticate.bind(authMiddleware), sessionAnalysisController.create);
  router.delete('/:id', authMiddleware.authenticate.bind(authMiddleware), sessionAnalysisController.delete);
  router.post('/:id/process', authMiddleware.authenticate.bind(authMiddleware), sessionAnalysisController.process);

  return router;
}
