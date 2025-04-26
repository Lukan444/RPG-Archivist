import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Session } from '../models/session.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
}

/**
 * Session controller for handling session-related requests
 */
export class SessionController {
  private repositoryFactory: RepositoryFactory;

  constructor(repositoryFactory: RepositoryFactory) {
    this.repositoryFactory = repositoryFactory;
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
   * Get all sessions
   * @param req Express request
   * @param res Express response
   */
  public async getAllSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const campaignId = req.query.campaign_id as string;
      const userId = req.user?.user_id;

      // Get sessions
      const { sessions, total } = await this.repositoryFactory.getSessionRepository().findAll({
        campaignId,
        userId,
        page,
        limit,
        search
      });

      // Return response
      res.status(200).json({
        success: true,
        data: sessions,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting sessions',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get session by ID
   * @param req Express request
   * @param res Express response
   */
  public async getSessionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get session ID from request parameters
      const sessionId = req.params.id;

      // Get session
      const session = await this.repositoryFactory.getSessionRepository().findById(sessionId);

      // Check if session exists
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }

      // Return response
      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting session',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create session
   * @param req Express request
   * @param res Express response
   */
  public async createSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if campaign exists
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(req.body.campaign_id);
      if (!campaign) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CAMPAIGN_NOT_FOUND',
            message: 'Campaign not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(req.body.campaign_id, userId) : false;
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Create session
      const now = new Date().toISOString();
      const session = await this.repositoryFactory.getSessionRepository().create({
        campaign_id: req.body.campaign_id,
        name: req.body.name,
        description: req.body.description,
        number: req.body.number,
        date: req.body.date,
        duration_minutes: req.body.duration_minutes,
        is_completed: req.body.is_completed,
        created_at: now,
        created_by: userId || 'system'
      });

      // Return response
      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating session',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update session
   * @param req Express request
   * @param res Express response
   */
  public async updateSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: errors.array()
          }
        });
        return;
      }

      // Get session ID from request parameters
      const sessionId = req.params.id;

      // Get session
      const session = await this.repositoryFactory.getSessionRepository().findById(sessionId);

      // Check if session exists
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(session.campaign_id, userId) : false;
      if (!isParticipant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this campaign'
          }
        });
        return;
      }

      // Update session
      const updatedSession = await this.repositoryFactory.getSessionRepository().update(sessionId, {
        name: req.body.name,
        description: req.body.description,
        number: req.body.number,
        date: req.body.date,
        duration_minutes: req.body.duration_minutes,
        is_completed: req.body.is_completed
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedSession
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating session',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete session
   * @param req Express request
   * @param res Express response
   */
  public async deleteSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get session ID from request parameters
      const sessionId = req.params.id;

      // Get session
      const session = await this.repositoryFactory.getSessionRepository().findById(sessionId);

      // Check if session exists
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }

      // Check if user is owner of campaign
      const userId = req.user?.user_id;
      const isOwner = userId ? await this.repositoryFactory.getCampaignRepository().isOwner(session.campaign_id, userId) : false;
      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not the owner of this campaign'
          }
        });
        return;
      }

      // Delete session
      try {
        const deleted = await this.repositoryFactory.getSessionRepository().delete(sessionId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Cannot delete session with associated transcriptions') {
          res.status(400).json({
            success: false,
            error: {
              code: 'SESSION_HAS_TRANSCRIPTIONS',
              message: 'Cannot delete session with associated transcriptions'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting session',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
