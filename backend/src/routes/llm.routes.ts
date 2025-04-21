import { Router } from 'express';
import { LLMController } from '../controllers/llm.controller';
import { LLMService } from '../services/llm.service';
import { RepositoryFactory } from '../repositories/repository.factory';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

/**
 * Create LLM routes
 * @param repositoryFactory Repository factory
 * @returns Router
 */
export const llmRoutes = (repositoryFactory: RepositoryFactory) => {
  const router = Router();

  // Create LLM repository
  const llmRepository = repositoryFactory.getLLMRepository();

  // Create LLM service
  const llmService = new LLMService(llmRepository);

  // Initialize LLM service
  llmService.initialize().catch(error => {
    console.error('Error initializing LLM service:', error);
  });

  // Create LLM controller
  const llmController = new LLMController(llmService);

  // Configuration routes
  router.get('/config', authenticate(), adminOnly(), llmController.getConfig);
  router.put('/config', authenticate(), adminOnly(), llmController.updateConfig);

  // Model routes
  router.get('/models', authenticate(), llmController.getModels);
  router.get('/models/:id', authenticate(), llmController.getModel);

  // Chat routes
  router.post('/chat', authenticate(), llmController.chat);
  router.post('/chat/stream', authenticate(), llmController.chatStream);

  // Prompt template routes
  router.get('/templates', authenticate(), llmController.getPromptTemplates);
  router.get('/templates/:id', authenticate(), llmController.getPromptTemplate);
  router.post('/templates', authenticate(), adminOnly(), llmController.createPromptTemplate);
  router.put('/templates/:id', authenticate(), adminOnly(), llmController.updatePromptTemplate);
  router.delete('/templates/:id', authenticate(), adminOnly(), llmController.deletePromptTemplate);
  router.post('/templates/:id/render', authenticate(), llmController.renderPromptTemplate);

  // Context routes
  router.get('/context/:sessionId', authenticate(), llmController.getContext);
  router.post('/context/:sessionId', authenticate(), llmController.saveContext);
  router.delete('/context/:sessionId', authenticate(), llmController.deleteContext);

  // Cache routes
  router.post('/cache/clear', authenticate(), adminOnly(), llmController.clearCache);

  return router;
};
