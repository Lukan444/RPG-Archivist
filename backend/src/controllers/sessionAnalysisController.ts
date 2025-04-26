import { Request, Response } from 'express';
import { SessionAnalysisService } from '../services/session-analysis.service';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
};

export class SessionAnalysisController {
  private sessionAnalysisService: SessionAnalysisService;

  constructor(sessionAnalysisService: SessionAnalysisService) {
    this.sessionAnalysisService = sessionAnalysisService;

    // Bind methods to ensure 'this' context
    this.createSessionAnalysis = this.createSessionAnalysis.bind(this);
    this.getSessionAnalysisById = this.getSessionAnalysisById.bind(this);
    this.getSessionAnalysisBySessionId = this.getSessionAnalysisBySessionId.bind(this);
    this.getSessionAnalysisByTranscriptionId = this.getSessionAnalysisByTranscriptionId.bind(this);
    this.processSessionAnalysis = this.processSessionAnalysis.bind(this);
    this.deleteSessionAnalysis = this.deleteSessionAnalysis.bind(this);
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
   * Create a new session analysis
   * @param req Request
   * @param res Response
   */
  async createSessionAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { session_id, transcription_id } = req.body;

      // Validate required fields
      if (!session_id || !transcription_id) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Session ID and transcription ID are required'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Create session analysis
      const sessionAnalysis = await this.sessionAnalysisService.createSessionAnalysis(
        session_id,
        transcription_id,
        userId || 'system' // Provide default value if userId is undefined
      );

      // Return success response
      res.status(201).json({
        success: true,
        data: sessionAnalysis
      });
    } catch (error) {
      console.error('Error creating session analysis:', error);

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create session analysis',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get session analysis by ID
   * @param req Request
   * @param res Response
   */
  async getSessionAnalysisById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisService.getSessionAnalysisById(id);

      // Return success response
      res.status(200).json({
        success: true,
        data: sessionAnalysis
      });
    } catch (error) {
      console.error('Error getting session analysis:', error);

      // Check if analysis not found
      if (error instanceof Error && error.message === 'Session analysis not found') {
        res.status(404).json({
          success: false,
          error: {
            message: 'Session analysis not found'
          }
        });
        return;
      }

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get session analysis',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get session analysis by session ID
   * @param req Request
   * @param res Response
   */
  async getSessionAnalysisBySessionId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisService.getSessionAnalysisBySessionId(sessionId);

      // Return success response
      res.status(200).json({
        success: true,
        data: sessionAnalysis
      });
    } catch (error) {
      console.error('Error getting session analysis by session ID:', error);

      // Check if analysis not found
      if (error instanceof Error && error.message === 'No analysis found for this session') {
        res.status(404).json({
          success: false,
          error: {
            message: 'No analysis found for this session'
          }
        });
        return;
      }

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get session analysis',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get session analysis by transcription ID
   * @param req Request
   * @param res Response
   */
  async getSessionAnalysisByTranscriptionId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { transcriptionId } = req.params;

      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisService.getSessionAnalysisByTranscriptionId(transcriptionId);

      // Return success response
      res.status(200).json({
        success: true,
        data: sessionAnalysis
      });
    } catch (error) {
      console.error('Error getting session analysis by transcription ID:', error);

      // Check if analysis not found
      if (error instanceof Error && error.message === 'No analysis found for this transcription') {
        res.status(404).json({
          success: false,
          error: {
            message: 'No analysis found for this transcription'
          }
        });
        return;
      }

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get session analysis',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Process session analysis
   * @param req Request
   * @param res Response
   */
  async processSessionAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const options = req.body;

      // Process session analysis
      const sessionAnalysis = await this.sessionAnalysisService.processSessionAnalysis(id, options);

      // Return success response
      res.status(200).json({
        success: true,
        data: sessionAnalysis
      });
    } catch (error) {
      console.error('Error processing session analysis:', error);

      // Check if analysis not found
      if (error instanceof Error && error.message === 'Session analysis not found') {
        res.status(404).json({
          success: false,
          error: {
            message: 'Session analysis not found'
          }
        });
        return;
      }

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to process session analysis',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete session analysis
   * @param req Request
   * @param res Response
   */
  async deleteSessionAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Delete session analysis
      await this.sessionAnalysisService.deleteSessionAnalysis(id);

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          message: 'Session analysis deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting session analysis:', error);

      // Check if analysis not found
      if (error instanceof Error && error.message === 'Session analysis not found') {
        res.status(404).json({
          success: false,
          error: {
            message: 'Session analysis not found'
          }
        });
        return;
      }

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete session analysis',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
