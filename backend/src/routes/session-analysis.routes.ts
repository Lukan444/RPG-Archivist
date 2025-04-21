import { Router } from 'express';
import { SessionAnalysisController } from '../controllers/sessionAnalysisController';
import { RepositoryFactory } from '../repositories/repository.factory';
import { SessionAnalysisService } from '../services/session-analysis.service';
import { authenticate } from '../middleware/auth.middleware';

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

  // Routes
  router.get('/:id', authenticate(), sessionAnalysisController.getSessionAnalysisById);
  router.get('/session/:sessionId', authenticate(), sessionAnalysisController.getSessionAnalysisBySessionId);
  router.get('/transcription/:transcriptionId', authenticate(), sessionAnalysisController.getSessionAnalysisByTranscriptionId);
  router.post('/', authenticate(), sessionAnalysisController.createSessionAnalysis);
  router.delete('/:id', authenticate(), sessionAnalysisController.deleteSessionAnalysis);
  router.post('/:id/process', authenticate(), sessionAnalysisController.processSessionAnalysis);

  return router;
}
