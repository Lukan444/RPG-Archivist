import { Request, Response } from 'express';
import { ChangeProposalService } from '../services/change-proposal.service';
import {
  ProposalStatus,
  ProposalType,
  ProposalEntityType,
  ProposalGenerationRequest,
  ProposalFilterOptions,
  ProposalTemplate
} from '../models/change-proposal.model';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    user_id?: string;
    role?: string;
  };
}

/**
 * Controller for change proposal endpoints
 */
export class ChangeProposalController {
  private changeProposalService: ChangeProposalService;

  /**
   * Helper method to safely get error message
   * @param error Any error object
   * @returns Error message as string
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  constructor(changeProposalService: ChangeProposalService) {
    this.changeProposalService = changeProposalService;

    // Bind methods to ensure 'this' context
    this.getProposal = this.getProposal.bind(this);
    this.getProposals = this.getProposals.bind(this);
    this.createProposal = this.createProposal.bind(this);
    this.updateProposal = this.updateProposal.bind(this);
    this.deleteProposal = this.deleteProposal.bind(this);
    this.addComment = this.addComment.bind(this);
    this.reviewProposal = this.reviewProposal.bind(this);
    this.applyProposal = this.applyProposal.bind(this);
    this.generateProposal = this.generateProposal.bind(this);
    this.getTemplate = this.getTemplate.bind(this);
    this.getTemplates = this.getTemplates.bind(this);
    this.createTemplate = this.createTemplate.bind(this);
    this.updateTemplate = this.updateTemplate.bind(this);
    this.deleteTemplate = this.deleteTemplate.bind(this);
  }

  /**
   * Get change proposal by ID
   * @param req Request
   * @param res Response
   */
  public async getProposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const proposal = await this.changeProposalService.getProposal(id);

      if (!proposal) {
        res.status(404).json({
          success: false,
          error: {
            message: `Proposal with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: proposal
      });
    } catch (error) {
      console.error('Error getting change proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get change proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get all change proposals with optional filtering
   * @param req Request
   * @param res Response
   */
  public async getProposals(req: Request, res: Response): Promise<void> {
    try {
      const filter: ProposalFilterOptions = {};

      // Parse filter options from query parameters
      if (req.query.status) {
        filter.status = (req.query.status as string).split(',') as ProposalStatus[];
      }

      if (req.query.type) {
        filter.type = (req.query.type as string).split(',') as ProposalType[];
      }

      if (req.query.entityType) {
        filter.entityType = (req.query.entityType as string).split(',') as ProposalEntityType[];
      }

      if (req.query.entityId) {
        filter.entityId = req.query.entityId as string;
      }

      if (req.query.contextId) {
        filter.contextId = req.query.contextId as string;
      }

      if (req.query.createdBy) {
        filter.createdBy = req.query.createdBy as string;
      }

      if (req.query.createdAfter) {
        filter.createdAfter = parseInt(req.query.createdAfter as string);
      }

      if (req.query.createdBefore) {
        filter.createdBefore = parseInt(req.query.createdBefore as string);
      }

      if (req.query.search) {
        filter.search = req.query.search as string;
      }

      const proposals = await this.changeProposalService.getProposals(
        Object.keys(filter).length > 0 ? filter : undefined
      );

      res.status(200).json({
        success: true,
        data: proposals
      });
    } catch (error) {
      console.error('Error getting change proposals:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get change proposals',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create a new change proposal
   * @param req Request
   * @param res Response
   */
  public async createProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const proposal = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User ID is required'
          }
        });
        return;
      }

      const createdProposal = await this.changeProposalService.createProposal(proposal, userId);

      res.status(201).json({
        success: true,
        data: createdProposal
      });
    } catch (error) {
      console.error('Error creating change proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create change proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update change proposal
   * @param req Request
   * @param res Response
   */
  public async updateProposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const proposal = req.body;

      const updatedProposal = await this.changeProposalService.updateProposal(id, proposal);

      res.status(200).json({
        success: true,
        data: updatedProposal
      });
    } catch (error) {
      console.error('Error updating change proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update change proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete change proposal
   * @param req Request
   * @param res Response
   */
  public async deleteProposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.changeProposalService.deleteProposal(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: `Proposal with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Proposal deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting change proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete change proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Add comment to proposal
   * @param req Request
   * @param res Response
   */
  public async addComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User ID is required'
          }
        });
        return;
      }

      if (!content) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Comment content is required'
          }
        });
        return;
      }

      const updatedProposal = await this.changeProposalService.addComment(id, content, userId);

      res.status(200).json({
        success: true,
        data: updatedProposal
      });
    } catch (error) {
      console.error('Error adding comment to proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to add comment to proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Review proposal
   * @param req Request
   * @param res Response
   */
  public async reviewProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User ID is required'
          }
        });
        return;
      }

      if (!status || !Object.values(ProposalStatus).includes(status as ProposalStatus)) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Valid status is required'
          }
        });
        return;
      }

      const updatedProposal = await this.changeProposalService.reviewProposal(
        id,
        status as ProposalStatus,
        userId,
        comment
      );

      res.status(200).json({
        success: true,
        data: updatedProposal
      });
    } catch (error) {
      console.error('Error reviewing proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to review proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Apply proposal changes to the entity
   * @param req Request
   * @param res Response
   */
  public async applyProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User ID is required'
          }
        });
        return;
      }

      const result = await this.changeProposalService.applyProposal(id, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            message: result.message,
            details: result.details
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error applying proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to apply proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Generate proposal using LLM
   * @param req Request
   * @param res Response
   */
  public async generateProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const request: ProposalGenerationRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User ID is required'
          }
        });
        return;
      }

      if (!request.entityType) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Entity type is required'
          }
        });
        return;
      }

      const proposal = await this.changeProposalService.generateProposal(request, userId);

      res.status(201).json({
        success: true,
        data: proposal
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate proposal',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get proposal template by ID
   * @param req Request
   * @param res Response
   */
  public async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const template = await this.changeProposalService.getTemplate(id);

      if (!template) {
        res.status(404).json({
          success: false,
          error: {
            message: `Template with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error getting proposal template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get proposal template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get all proposal templates
   * @param req Request
   * @param res Response
   */
  public async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as ProposalEntityType | undefined;

      const templates = await this.changeProposalService.getTemplates(entityType);

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting proposal templates:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get proposal templates',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create proposal template
   * @param req Request
   * @param res Response
   */
  public async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const template: Omit<ProposalTemplate, 'id'> = req.body;

      if (!template.name || !template.entityType || !template.promptTemplate) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Name, entity type, and prompt template are required'
          }
        });
        return;
      }

      const createdTemplate = await this.changeProposalService.createTemplate(template);

      res.status(201).json({
        success: true,
        data: createdTemplate
      });
    } catch (error) {
      console.error('Error creating proposal template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create proposal template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update proposal template
   * @param req Request
   * @param res Response
   */
  public async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const template: Partial<Omit<ProposalTemplate, 'id'>> = req.body;

      const updatedTemplate = await this.changeProposalService.updateTemplate(id, template);

      res.status(200).json({
        success: true,
        data: updatedTemplate
      });
    } catch (error) {
      console.error('Error updating proposal template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update proposal template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete proposal template
   * @param req Request
   * @param res Response
   */
  public async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.changeProposalService.deleteTemplate(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: `Template with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Template deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting proposal template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete proposal template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
