import { Router } from 'express';
import { ContentAnalysisController } from '../controllers/content-analysis.controller';
import { ContentAnalysisService } from '../services/content-analysis.service';
import { LLMService } from '../services/llm.service';
import { SessionAnalysisService } from '../services/session-analysis.service';
import { TranscriptionService } from '../services/transcription.service';
import { RepositoryFactory } from '../repositories/repository.factory';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Create content analysis routes
 * @param repositoryFactory Repository factory
 * @param llmService LLM service
 * @returns Router
 */
export const contentAnalysisRoutes = (
  repositoryFactory: RepositoryFactory,
  llmService: LLMService
) => {
  const router = Router();

  // Create content analysis repository
  const contentAnalysisRepository = repositoryFactory.getContentAnalysisRepository();

  // Create session analysis service
  const sessionAnalysisService = new SessionAnalysisService(
    repositoryFactory.getSessionAnalysisRepository(),
    repositoryFactory.getSessionRepository(),
    llmService
  );

  // Create transcription service
  const transcriptionService = new TranscriptionService(
    repositoryFactory.getTranscriptionRepository(),
    repositoryFactory.getAudioRecordingRepository()
  );

  // Create content analysis service
  const contentAnalysisService = new ContentAnalysisService(
    contentAnalysisRepository,
    llmService,
    sessionAnalysisService,
    transcriptionService,
    repositoryFactory
  );

  // Create content analysis controller
  const contentAnalysisController = new ContentAnalysisController(contentAnalysisService);

  // Suggestion routes
  router.get('/suggestions', authenticate(), contentAnalysisController.getSuggestions);
  router.get('/suggestions/:id', authenticate(), contentAnalysisController.getSuggestion);
  router.put('/suggestions/:id', authenticate(), contentAnalysisController.updateSuggestion);
  router.delete('/suggestions/:id', authenticate(), contentAnalysisController.deleteSuggestion);

  // Suggestion actions
  router.post('/suggestions/:id/accept', authenticate(), contentAnalysisController.acceptSuggestion);
  router.post('/suggestions/:id/reject', authenticate(), contentAnalysisController.rejectSuggestion);
  router.post('/suggestions/:id/modify', authenticate(), contentAnalysisController.modifySuggestion);

  // Analysis result routes
  router.get('/results', authenticate(), contentAnalysisController.getAnalysisResults);
  router.get('/results/:id', authenticate(), contentAnalysisController.getAnalysisResult);
  router.delete('/results/:id', authenticate(), contentAnalysisController.deleteAnalysisResult);

  // Analysis action
  router.post('/analyze', authenticate(), contentAnalysisController.analyzeContent);

  return router;
};
