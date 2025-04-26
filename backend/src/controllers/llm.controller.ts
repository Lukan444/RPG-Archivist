import { Request, Response } from 'express';
import { LLMService } from '../services/llm.service';
import {
  LLMMessage,
  LLMMessageRole,
  LLMRequestOptions,
  PromptTemplateVariables
} from '../models/llm.model';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
};

/**
 * Controller for LLM-related endpoints
 */
export class LLMController {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;

    // Bind methods to ensure 'this' context
    this.getConfig = this.getConfig.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.getModels = this.getModels.bind(this);
    this.getModel = this.getModel.bind(this);
    this.chat = this.chat.bind(this);
    this.chatStream = this.chatStream.bind(this);
    this.getPromptTemplates = this.getPromptTemplates.bind(this);
    this.getPromptTemplate = this.getPromptTemplate.bind(this);
    this.createPromptTemplate = this.createPromptTemplate.bind(this);
    this.updatePromptTemplate = this.updatePromptTemplate.bind(this);
    this.deletePromptTemplate = this.deletePromptTemplate.bind(this);
    this.renderPromptTemplate = this.renderPromptTemplate.bind(this);
    this.getContext = this.getContext.bind(this);
    this.saveContext = this.saveContext.bind(this);
    this.deleteContext = this.deleteContext.bind(this);
    this.clearCache = this.clearCache.bind(this);
  }

  /**
   * Get error message from error object
   * @param error Error object
   * @returns Error message
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Get LLM configuration
   * @param req Request
   * @param res Response
   */
  public async getConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const config = await this.llmService.getConfig();

      // Remove sensitive information
      const safeConfig = {
        ...config,
        apiKey: config.apiKey ? '********' : undefined
      };

      res.status(200).json({
        success: true,
        data: safeConfig
      });
    } catch (error) {
      console.error('Error getting LLM configuration:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get LLM configuration',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update LLM configuration
   * @param req Request
   * @param res Response
   */
  public async updateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const config = req.body;

      // Validate request
      if (!config) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Configuration is required'
          }
        });
        return;
      }

      const updatedConfig = await this.llmService.updateConfig(config);

      // Remove sensitive information
      const safeConfig = {
        ...updatedConfig,
        apiKey: updatedConfig.apiKey ? '********' : undefined
      };

      res.status(200).json({
        success: true,
        data: safeConfig
      });
    } catch (error) {
      console.error('Error updating LLM configuration:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update LLM configuration',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get available models
   * @param req Request
   * @param res Response
   */
  public async getModels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const models = await this.llmService.getModels();

      res.status(200).json({
        success: true,
        data: models
      });
    } catch (error) {
      console.error('Error getting LLM models:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get LLM models',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get model by ID
   * @param req Request
   * @param res Response
   */
  public async getModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const model = await this.llmService.getModel(id);

      if (!model) {
        res.status(404).json({
          success: false,
          error: {
            message: `Model with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: model
      });
    } catch (error) {
      console.error('Error getting LLM model:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get LLM model',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Send chat completion request
   * @param req Request
   * @param res Response
   */
  public async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { messages, options } = req.body;

      // Validate request
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Messages are required and must be an array'
          }
        });
        return;
      }

      // Add user ID to system message if not present
      const userId = req.user?.user_id;

      if (userId) {
        const hasSystemMessage = messages.some(msg => msg.role === LLMMessageRole.SYSTEM);

        if (!hasSystemMessage) {
          messages.unshift({
            role: LLMMessageRole.SYSTEM,
            content: `You are RPG Archivist's AI assistant. The user ID is ${userId}.`
          });
        }
      }

      const response = await this.llmService.chat(messages, options);

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error sending chat completion request:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to send chat completion request',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Send streaming chat completion request
   * @param req Request
   * @param res Response
   */
  public async chatStream(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { messages, options } = req.body;

      // Validate request
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Messages are required and must be an array'
          }
        });
        return;
      }

      // Add user ID to system message if not present
      const userId = req.user?.user_id;

      if (userId) {
        const hasSystemMessage = messages.some(msg => msg.role === LLMMessageRole.SYSTEM);

        if (!hasSystemMessage) {
          messages.unshift({
            role: LLMMessageRole.SYSTEM,
            content: `You are RPG Archivist's AI assistant. The user ID is ${userId}.`
          });
        }
      }

      // Set headers for streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send streaming response
      await this.llmService.chatStream(
        messages,
        (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
        { ...options, stream: true }
      );

      // End response
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Error sending streaming chat completion request:', error);

      // Send error response
      res.write(`data: ${JSON.stringify({
        success: false,
        error: {
          message: 'Failed to send streaming chat completion request',
          details: this.getErrorMessage(error)
        }
      })}\n\n`);

      res.end();
    }
  }

  /**
   * Get all prompt templates
   * @param req Request
   * @param res Response
   */
  public async getPromptTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const templates = await this.llmService.getPromptTemplates();

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting prompt templates:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get prompt templates',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get prompt template by ID
   * @param req Request
   * @param res Response
   */
  public async getPromptTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const template = await this.llmService.getPromptTemplate(id);

      if (!template) {
        res.status(404).json({
          success: false,
          error: {
            message: `Prompt template with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error getting prompt template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get prompt template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create prompt template
   * @param req Request
   * @param res Response
   */
  public async createPromptTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const template = req.body;

      // Validate request
      if (!template || !template.name || !template.template) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Name and template are required'
          }
        });
        return;
      }

      const createdTemplate = await this.llmService.createPromptTemplate(template);

      res.status(201).json({
        success: true,
        data: createdTemplate
      });
    } catch (error) {
      console.error('Error creating prompt template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create prompt template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update prompt template
   * @param req Request
   * @param res Response
   */
  public async updatePromptTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const template = req.body;

      // Validate request
      if (!template) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Template is required'
          }
        });
        return;
      }

      const updatedTemplate = await this.llmService.updatePromptTemplate(id, template);

      res.status(200).json({
        success: true,
        data: updatedTemplate
      });
    } catch (error) {
      console.error('Error updating prompt template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update prompt template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete prompt template
   * @param req Request
   * @param res Response
   */
  public async deletePromptTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.llmService.deletePromptTemplate(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: `Prompt template with ID ${id} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Prompt template deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting prompt template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete prompt template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Render prompt template
   * @param req Request
   * @param res Response
   */
  public async renderPromptTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const variables: PromptTemplateVariables = req.body;

      // Validate request
      if (!variables) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Variables are required'
          }
        });
        return;
      }

      const renderedPrompt = await this.llmService.renderPromptTemplate(id, variables);

      res.status(200).json({
        success: true,
        data: {
          prompt: renderedPrompt
        }
      });
    } catch (error) {
      console.error('Error rendering prompt template:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to render prompt template',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get LLM context by session ID
   * @param req Request
   * @param res Response
   */
  public async getContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const context = await this.llmService.getContext(sessionId);

      if (!context) {
        res.status(404).json({
          success: false,
          error: {
            message: `LLM context for session ${sessionId} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: context
      });
    } catch (error) {
      console.error('Error getting LLM context:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get LLM context',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create or update LLM context
   * @param req Request
   * @param res Response
   */
  public async saveContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const context = req.body;

      // Validate request
      if (!context || !context.messages) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Context with messages is required'
          }
        });
        return;
      }

      // Add session ID and user ID
      context.sessionId = sessionId;
      context.userId = req.user?.user_id;

      const savedContext = await this.llmService.saveContext(context);

      res.status(200).json({
        success: true,
        data: savedContext
      });
    } catch (error) {
      console.error('Error saving LLM context:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to save LLM context',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete LLM context
   * @param req Request
   * @param res Response
   */
  public async deleteContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const deleted = await this.llmService.deleteContext(sessionId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: `LLM context for session ${sessionId} not found`
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'LLM context deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting LLM context:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete LLM context',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Clear cache
   * @param req Request
   * @param res Response
   */
  public async clearCache(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await this.llmService.clearCache();

      res.status(200).json({
        success: true,
        data: {
          message: 'LLM cache cleared successfully'
        }
      });
    } catch (error) {
      console.error('Error clearing LLM cache:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to clear LLM cache',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
