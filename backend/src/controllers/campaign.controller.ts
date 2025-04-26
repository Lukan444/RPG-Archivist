import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Campaign, CampaignUserRelationshipType } from '../models/campaign.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
}

/**
 * Campaign controller for handling campaign-related requests
 */
export class CampaignController {
  private repositoryFactory: RepositoryFactory;

  /**
   * Helper method to safely get error message
   * @param error Any error object
   * @returns Error message as string
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  constructor(repositoryFactory: RepositoryFactory) {
    this.repositoryFactory = repositoryFactory;
  }

  /**
   * Get all campaigns
   * @param req Express request
   * @param res Express response
   */
  public async getAllCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const worldId = req.query.world_id as string;
      const userId = req.query.user_id as string || req.user?.user_id;

      // Get campaigns
      const { campaigns, total } = await this.repositoryFactory.getCampaignRepository().findAll(
        userId,
        worldId,
        page,
        limit,
        req.query.sort as string || 'created_at',
        req.query.order as 'asc' | 'desc' || 'desc',
        search
      );

      // Return response
      res.status(200).json({
        success: true,
        data: campaigns,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting campaigns:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaigns',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get campaign by ID
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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

      // Return response
      res.status(200).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Error getting campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create campaign
   * @param req Express request
   * @param res Express response
   */
  public async createCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Check if RPG World exists
      const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().findById(req.body.world_id);
      if (!rpgWorld) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RPG_WORLD_NOT_FOUND',
            message: 'RPG World not found'
          }
        });
        return;
      }

      // Check if campaign with same name already exists in the same RPG World
      const existingCampaign = await this.repositoryFactory.getCampaignRepository().findByName(req.body.name, req.body.world_id);
      if (existingCampaign) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_NAME_EXISTS',
            message: 'Campaign with this name already exists in the same RPG World'
          }
        });
        return;
      }

      // Create campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().create({
        name: req.body.name,
        description: req.body.description,
        world_id: req.body.world_id,
        start_date: req.body.start_date,
        is_active: req.body.is_active
      });

      // Return response
      res.status(201).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update campaign
   * @param req Express request
   * @param res Express response
   */
  public async updateCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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

      // Check if user is owner of campaign
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isOwner = await this.repositoryFactory.getCampaignRepository().isOwner(campaignId, userId);
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

      // Check if RPG World exists if provided
      if (req.body.world_id) {
        const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().findById(req.body.world_id);
        if (!rpgWorld) {
          res.status(404).json({
            success: false,
            error: {
              code: 'RPG_WORLD_NOT_FOUND',
              message: 'RPG World not found'
            }
          });
          return;
        }
      }

      // Check if name is being updated and if it already exists in the same RPG World
      if (req.body.name && req.body.name !== campaign.name) {
        const worldId = req.body.world_id || campaign.world_id;
        const existingCampaign = await this.repositoryFactory.getCampaignRepository().findByName(req.body.name, worldId);
        if (existingCampaign && existingCampaign.campaign_id !== campaignId) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CAMPAIGN_NAME_EXISTS',
              message: 'Campaign with this name already exists in the same RPG World'
            }
          });
          return;
        }
      }

      // Update campaign
      const updatedCampaign = await this.repositoryFactory.getCampaignRepository().update(campaignId, {
        name: req.body.name,
        description: req.body.description,
        world_id: req.body.world_id,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        is_active: req.body.is_active
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedCampaign
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete campaign
   * @param req Express request
   * @param res Express response
   */
  public async deleteCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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

      // Check if user is owner of campaign
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isOwner = await this.repositoryFactory.getCampaignRepository().isOwner(campaignId, userId);
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

      // Delete campaign
      try {
        const deleted = await this.repositoryFactory.getCampaignRepository().delete(campaignId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Cannot delete campaign with associated sessions') {
          res.status(400).json({
            success: false,
            error: {
              code: 'CAMPAIGN_HAS_SESSIONS',
              message: 'Cannot delete campaign with associated sessions'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get users for campaign
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
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

      // Get users
      const users = await this.repositoryFactory.getCampaignRepository().getUsers(campaignId);

      // Return response
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error getting campaign users:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign users',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Add user to campaign
   * @param req Express request
   * @param res Express response
   */
  public async addUserToCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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

      // Check if user is owner of campaign
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isOwner = await this.repositoryFactory.getCampaignRepository().isOwner(campaignId, userId);
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

      // Check if user exists
      const user = await this.repositoryFactory.getUserRepository().findById(req.body.user_id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      // Add user to campaign
      const relationship = await this.repositoryFactory.getCampaignRepository().addUser({
        campaign_id: campaignId,
        user_id: req.body.user_id,
        relationship_type: req.body.relationship_type
      });

      // Return response
      res.status(200).json({
        success: true,
        data: relationship
      });
    } catch (error) {
      console.error('Error adding user to campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while adding user to campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Remove user from campaign
   * @param req Express request
   * @param res Express response
   */
  public async removeUserFromCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID and user ID from request parameters
      const campaignId = req.params.id;
      const userIdToRemove = req.params.userId;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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

      // Check if user is owner of campaign
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isOwner = await this.repositoryFactory.getCampaignRepository().isOwner(campaignId, userId);
      if (!isOwner && userId !== userIdToRemove) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not the owner of this campaign'
          }
        });
        return;
      }

      // Check if user exists
      const user = await this.repositoryFactory.getUserRepository().findById(userIdToRemove);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      // Remove user from campaign
      try {
        const removed = await this.repositoryFactory.getCampaignRepository().removeUser(campaignId, userIdToRemove);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            removed
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Cannot remove the only owner of a campaign') {
          res.status(400).json({
            success: false,
            error: {
              code: 'CANNOT_REMOVE_ONLY_OWNER',
              message: 'Cannot remove the only owner of a campaign'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error removing user from campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing user from campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update user role in campaign
   * @param req Express request
   * @param res Express response
   */
  public async updateUserRoleInCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get campaign ID and user ID from request parameters
      const campaignId = req.params.id;
      const userIdToUpdate = req.params.userId;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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

      // Check if user is owner of campaign
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isOwner = await this.repositoryFactory.getCampaignRepository().isOwner(campaignId, userId);
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

      // Check if user exists
      const user = await this.repositoryFactory.getUserRepository().findById(userIdToUpdate);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      // Update user role
      const relationship = await this.repositoryFactory.getCampaignRepository().addUser({
        campaign_id: campaignId,
        user_id: userIdToUpdate,
        relationship_type: req.body.relationship_type
      });

      // Return response
      res.status(200).json({
        success: true,
        data: relationship
      });
    } catch (error) {
      console.error('Error updating user role in campaign:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating user role in campaign',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get sessions for campaign
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
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

      // Get sessions
      const sessions = await this.repositoryFactory.getCampaignRepository().getSessions(campaignId);

      // Return response
      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Error getting campaign sessions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign sessions',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get characters for campaign
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignCharacters(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
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

      // Get characters
      const characters = await this.repositoryFactory.getCampaignRepository().getCharacters(campaignId);

      // Return response
      res.status(200).json({
        success: true,
        data: characters
      });
    } catch (error) {
      console.error('Error getting campaign characters:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign characters',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get locations for campaign
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
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

      // Get locations
      const locations = await this.repositoryFactory.getCampaignRepository().getLocations(campaignId);

      // Return response
      res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Error getting campaign locations:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign locations',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get campaign statistics
   * @param req Express request
   * @param res Express response
   */
  public async getCampaignStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get campaign ID from request parameters
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await this.repositoryFactory.getCampaignRepository().findById(campaignId);

      // Check if campaign exists
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
      const userId = req.user?.user_id;

      // If userId is undefined, user is not authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be authenticated to access this resource'
          }
        });
        return;
      }

      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId);
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

      // Get statistics
      const statistics = await this.repositoryFactory.getCampaignRepository().getStatistics(campaignId);

      // Return response
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting campaign statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaign statistics',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
