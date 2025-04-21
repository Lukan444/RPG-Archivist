import { Request, Response } from 'express';
import { ContentAnalysisService } from '../services/content-analysis.service';
import {
  SuggestionType,
  SuggestionStatus,
  ConfidenceLevel,
  ContentAnalysisFilterOptions,
  ContentAnalysisRequest
} from '../models/content-analysis.model';

/**
 * Controller for content analysis endpoints
 */
export class ContentAnalysisController {
  private contentAnalysisService: ContentAnalysisService;

  constructor(contentAnalysisService: ContentAnalysisService) {
    this.contentAnalysisService = contentAnalysisService;

    // Bind methods to ensure 'this' context
    this.getSuggestion = this.getSuggestion.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
    this.updateSuggestion = this.updateSuggestion.bind(this);
    this.deleteSuggestion = this.deleteSuggestion.bind(this);
    this.acceptSuggestion = this.acceptSuggestion.bind(this);
    this.rejectSuggestion = this.rejectSuggestion.bind(this);
    this.modifySuggestion = this.modifySuggestion.bind(this);
    this.getAnalysisResult = this.getAnalysisResult.bind(this);
    this.getAnalysisResults = this.getAnalysisResults.bind(this);
    this.deleteAnalysisResult = this.deleteAnalysisResult.bind(this);
    this.analyzeContent = this.analyzeContent.bind(this);
  }

  /**
   * Get content suggestion by ID
   * @param req Request
   * @param res Response
   */
  public async getSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const suggestion = await this.contentAnalysisService.getSuggestion(id);
      
      if (!suggestion) {
        res.status(404).json({
          success: false,
          error: {
            message: `Suggestion with ID ${id} not found`
          }
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: suggestion
      });
    } catch (error) {
      console.error('Error getting content suggestion:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get content suggestion',
          details: error.message
        }
      });
    }
  }

  /**
   * Get all content suggestions with optional filtering
   * @param req Request
   * @param res Response
   */
  public async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const filter: ContentAnalysisFilterOptions = {};
      
      // Parse filter options from query parameters
      if (req.query.types) {
        filter.types = (req.query.types as string).split(',') as SuggestionType[];
      }
      
      if (req.query.status) {
        filter.status = (req.query.status as string).split(',') as SuggestionStatus[];
      }
      
      if (req.query.confidence) {
        filter.confidence = (req.query.confidence as string).split(',') as ConfidenceLevel[];
      }
      
      if (req.query.sourceId) {
        filter.sourceId = req.query.sourceId as string;
      }
      
      if (req.query.sourceType) {
        filter.sourceType = req.query.sourceType as string;
      }
      
      if (req.query.contextId) {
        filter.contextId = req.query.contextId as string;
      }
      
      if (req.query.contextType) {
        filter.contextType = req.query.contextType as string;
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
      
      const suggestions = await this.contentAnalysisService.getSuggestions(
        Object.keys(filter).length > 0 ? filter : undefined
      );
      
      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error getting content suggestions:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get content suggestions',
          details: error.message
        }
      });
    }
  }

  /**
   * Update content suggestion
   * @param req Request
   * @param res Response
   */
  public async updateSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const suggestion = req.body;
      
      const updatedSuggestion = await this.contentAnalysisService.updateSuggestion(id, suggestion);
      
      res.status(200).json({
        success: true,
        data: updatedSuggestion
      });
    } catch (error) {
      console.error('Error updating content suggestion:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update content suggestion',
          details: error.message
        }
      });
    }
  }

  /**
   * Delete content suggestion
   * @param req Request
   * @param res Response
   */
  public async deleteSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await this.contentAnalysisService.deleteSuggestion(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: `Suggestion with ID ${id} not found`
          }
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: {
          message: 'Suggestion deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting content suggestion:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete content suggestion',
          details: error.message
        }
      });
    }
  }

  /**
   * Accept content suggestion
   * @param req Request
   * @param res Response
   */
  public async acceptSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const updatedSuggestion = await this.contentAnalysisService.acceptSuggestion(id);
      
      res.status(200).json({
        success: true,
        data: updatedSuggestion
      });
    } catch (error) {
      console.error('Error accepting content suggestion:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to accept content suggestion',
          details: error.message
        }
      });
    }
  }

  /**
   * Reject content suggestion
   * @param req Request
   * @param res Response
   */
  public async rejectSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const updatedSuggestion = await this.contentAnalysisService.rejectSuggestion(id);
      
      res.status(200).json({
        success: true,
        data: updatedSuggestion
      });
    } catch (error) {
      console.error('Error rejecting content suggestion:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to reject content suggestion',
          details: error.message
        }
      });
    }
  }

  /**
   * Modify content suggestion
   * @param req Request
   * @param res Response
   */
  public async modifySuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const suggestion = req.body;
      
      const updatedSuggestion = await this.contentAnalysisService.modifySuggestion(id, suggestion);
      
      res.status(200).json({
        success: true,
        data: updatedSuggestion
      });
    } catch (error) {
      console.error('Error modifying content suggestion:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to modify content suggestion',
          details: error.message
        }
      });
    }
  }

  /**
   * Get content analysis result by ID
   * @param req Request
   * @param res Response
   */
  public async getAnalysisResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const result = await this.contentAnalysisService.getAnalysisResult(id);
      
      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            message: `Analysis result with ID ${id} not found`
          }
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting content analysis result:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get content analysis result',
          details: error.message
        }
      });
    }
  }

  /**
   * Get all content analysis results
   * @param req Request
   * @param res Response
   */
  public async getAnalysisResults(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.query.contextId as string | undefined;
      
      const results = await this.contentAnalysisService.getAnalysisResults(contextId);
      
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error getting content analysis results:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get content analysis results',
          details: error.message
        }
      });
    }
  }

  /**
   * Delete content analysis result
   * @param req Request
   * @param res Response
   */
  public async deleteAnalysisResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await this.contentAnalysisService.deleteAnalysisResult(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: `Analysis result with ID ${id} not found`
          }
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: {
          message: 'Analysis result deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting content analysis result:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete content analysis result',
          details: error.message
        }
      });
    }
  }

  /**
   * Analyze content and generate suggestions
   * @param req Request
   * @param res Response
   */
  public async analyzeContent(req: Request, res: Response): Promise<void> {
    try {
      const request: ContentAnalysisRequest = req.body;
      
      if (!request.analysisTypes || request.analysisTypes.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Analysis types are required'
          }
        });
        return;
      }
      
      if (!request.content && !request.transcriptionId && !request.sessionId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Content, transcription ID, or session ID is required'
          }
        });
        return;
      }
      
      const result = await this.contentAnalysisService.analyzeContent(request);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to analyze content',
          details: error.message
        }
      });
    }
  }
}
