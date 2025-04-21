import { Router } from 'express';
import { SessionAnalysisController } from '../controllers/sessionAnalysisController';
import { RepositoryFactory } from '../repositories/repository.factory';
import { SessionAnalysisService } from '../services/sessionAnalysisService';
import { authMiddleware } from '../middleware/auth.middleware';

export const sessionAnalysisRoutes = (repositoryFactory: RepositoryFactory) => {
  const router = Router();
  
  // Create services
  const sessionAnalysisService = new SessionAnalysisService(
    repositoryFactory.getSessionAnalysisRepository(),
    repositoryFactory.getTranscriptionRepository(),
    repositoryFactory.getSessionRepository(),
    repositoryFactory.getAudioRecordingRepository()
  );
  
  // Create controller
  const sessionAnalysisController = new SessionAnalysisController(sessionAnalysisService);
  
  // Apply auth middleware to all routes
  router.use(authMiddleware);
  
  // Routes
  
  // Get session analysis by ID
  router.get('/:id', sessionAnalysisController.getSessionAnalysisById);
  
  // Get session analysis by session ID
  router.get('/session/:sessionId', sessionAnalysisController.getSessionAnalysisBySessionId);
  
  // Get session analysis by transcription ID
  router.get('/transcription/:transcriptionId', sessionAnalysisController.getSessionAnalysisByTranscriptionId);
  
  // Create session analysis
  router.post('/', sessionAnalysisController.createSessionAnalysis);
  
  // Process session analysis
  router.post('/:id/process', sessionAnalysisController.processSessionAnalysis);
  
  // Delete session analysis
  router.delete('/:id', sessionAnalysisController.deleteSessionAnalysis);
  
  return router;
};
