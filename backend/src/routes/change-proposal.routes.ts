import { Router } from 'express';
import { ChangeProposalController } from '../controllers/change-proposal.controller';
import { ChangeProposalService } from '../services/change-proposal.service';
import { LLMService } from '../services/llm.service';
import { DatabaseService } from '../services/database.service';
import { RepositoryFactory } from '../repositories/repository.factory';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

/**
 * Create change proposal routes
 * @param repositoryFactory Repository factory
 * @param llmService LLM service
 * @param dbService Database service
 * @returns Router
 */
export const changeProposalRoutes = (
  repositoryFactory: RepositoryFactory,
  llmService: LLMService,
  dbService: DatabaseService
) => {
  const router = Router();

  // Create change proposal repository
  const changeProposalRepository = repositoryFactory.getChangeProposalRepository();

  // Create change proposal service
  const changeProposalService = new ChangeProposalService(
    changeProposalRepository,
    llmService,
    dbService,
    repositoryFactory
  );

  // Create change proposal controller
  const changeProposalController = new ChangeProposalController(changeProposalService);

  // Proposal routes
  router.get('/', authenticate, changeProposalController.getProposals);
  router.post('/', authenticate, changeProposalController.createProposal);
  router.get('/:id', authenticate, changeProposalController.getProposal);
  router.put('/:id', authenticate, changeProposalController.updateProposal);
  router.delete('/:id', authenticate, changeProposalController.deleteProposal);

  // Proposal actions
  router.post('/:id/comments', authenticate, changeProposalController.addComment);
  router.post('/:id/review', authenticate, changeProposalController.reviewProposal);
  router.post('/:id/apply', authenticate, changeProposalController.applyProposal);

  // Proposal generation
  router.post('/generate', authenticate, changeProposalController.generateProposal);

  // Template routes
  router.get('/templates', authenticate, changeProposalController.getTemplates);
  router.post('/templates', authenticate, adminOnly(), changeProposalController.createTemplate);
  router.get('/templates/:id', authenticate, changeProposalController.getTemplate);
  router.put('/templates/:id', authenticate, adminOnly(), changeProposalController.updateTemplate);
  router.delete('/templates/:id', authenticate, adminOnly(), changeProposalController.deleteTemplate);

  return router;
};
