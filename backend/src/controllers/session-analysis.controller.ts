import { Request, Response } from 'express';
import { SessionAnalysisService } from '../services/session-analysis.service';
import { AnalysisProcessingOptions } from '../models/session-analysis.model';
import { validateRequest } from '../utils/validation';
import { z } from 'zod';

/**
 * Controller for session analysis
 */
export class SessionAnalysisController {
  private sessionAnalysisService: SessionAnalysisService;

  constructor(sessionAnalysisService: SessionAnalysisService) {
    this.sessionAnalysisService = sessionAnalysisService;
  }

  /**
   * Get session analysis by ID
   * @param req Request
   * @param res Response
   */
  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { analysisId } = req.params;

      const analysis = await this.sessionAnalysisService.getById(analysisId);

      if (!analysis) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message: 'Session analysis not found.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error getting session analysis:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the session analysis.'
        }
      });
    }
  };

  /**
   * Get session analysis by session ID
   * @param req Request
   * @param res Response
   */
  public getBySessionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      const analysis = await this.sessionAnalysisService.getBySessionId(sessionId);

      if (!analysis) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message: 'Session analysis not found for this session.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error getting session analysis by session ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the session analysis.'
        }
      });
    }
  };

  /**
   * Get session analysis by transcription ID
   * @param req Request
   * @param res Response
   */
  public getByTranscriptionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptionId } = req.params;

      const analysis = await this.sessionAnalysisService.getByTranscriptionId(transcriptionId);

      if (!analysis) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message: 'Session analysis not found for this transcription.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error getting session analysis by transcription ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the session analysis.'
        }
      });
    }
  };

  /**
   * Create session analysis
   * @param req Request
   * @param res Response
   */
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = z.object({
        session_id: z.string().uuid(),
        transcription_id: z.string().uuid()
      });

      const validationResult = validateRequest(req.body, schema);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validationResult.errors
          }
        });
        return;
      }

      const { session_id, transcription_id } = req.body;

      // Create analysis
      const analysis = await this.sessionAnalysisService.create({
        session_id,
        transcription_id
      });

      res.status(201).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error creating session analysis:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating the session analysis.'
        }
      });
    }
  };

  /**
   * Delete session analysis
   * @param req Request
   * @param res Response
   */
  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { analysisId } = req.params;

      // Check if analysis exists
      const existingAnalysis = await this.sessionAnalysisService.getById(analysisId);
      if (!existingAnalysis) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message: 'Session analysis not found.'
          }
        });
        return;
      }

      // Delete analysis
      const deleted = await this.sessionAnalysisService.delete(analysisId);

      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error deleting session analysis:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting the session analysis.'
        }
      });
    }
  };

  /**
   * Process session analysis
   * @param req Request
   * @param res Response
   */
  public process = async (req: Request, res: Response): Promise<void> => {
    try {
      const { analysisId } = req.params;

      // Validate request
      const schema = z.object({
        include_sentiment_analysis: z.boolean().optional(),
        include_character_insights: z.boolean().optional(),
        include_plot_developments: z.boolean().optional(),
        include_topics: z.boolean().optional(),
        model: z.string().optional(),
        max_key_points: z.number().int().positive().optional(),
        max_topics: z.number().int().positive().optional(),
        min_relevance_score: z.number().min(0).max(1).optional()
      });

      const validationResult = validateRequest(req.body, schema);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validationResult.errors
          }
        });
        return;
      }

      // Check if analysis exists
      const existingAnalysis = await this.sessionAnalysisService.getById(analysisId);
      if (!existingAnalysis) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message: 'Session analysis not found.'
          }
        });
        return;
      }

      // Process analysis
      const options: AnalysisProcessingOptions = req.body;
      const analysis = await this.sessionAnalysisService.process(analysisId, options);

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error processing session analysis:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while processing the session analysis.'
        }
      });
    }
  };
}
