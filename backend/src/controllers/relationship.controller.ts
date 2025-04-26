import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { EntityType, Relationship } from '../models/relationship.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
};

/**
 * Relationship controller for handling relationship-related requests
 */
export class RelationshipController {
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
   * Get all relationships
   * @param req Express request
   * @param res Express response
   */
  public async getAllRelationships(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const campaignId = req.query.campaign_id as string;
      const sourceEntityId = req.query.source_entity_id as string;
      const sourceEntityType = req.query.source_entity_type as EntityType;
      const targetEntityId = req.query.target_entity_id as string;
      const targetEntityType = req.query.target_entity_type as EntityType;
      const relationshipType = req.query.relationship_type as string;
      const entityId = req.query.entity_id as string;
      const entityType = req.query.entity_type as EntityType;

      // Check if campaign_id is provided
      if (!campaignId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_ID_REQUIRED',
            message: 'Campaign ID is required'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(campaignId, userId) : false;
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

      // Get relationships
      const { relationships, total } = await this.repositoryFactory.getRelationshipRepository().findAll(
        campaignId,
        page,
        limit,
        req.query.sort as string || 'created_at',
        req.query.order as 'asc' | 'desc' || 'desc',
        {
          source_entity_id: sourceEntityId,
          source_entity_type: sourceEntityType,
          target_entity_id: targetEntityId,
          target_entity_type: targetEntityType,
          relationship_type: relationshipType,
          entity_id: entityId,
          entity_type: entityType
        }
      );

      // Return response
      res.status(200).json({
        success: true,
        data: relationships,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting relationships:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting relationships',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get relationship by ID
   * @param req Express request
   * @param res Express response
   */
  public async getRelationshipById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get relationship ID from request parameters
      const relationshipId = req.params.id;

      // Get relationship
      const relationship = await this.repositoryFactory.getRelationshipRepository().findById(relationshipId);

      // Check if relationship exists
      if (!relationship) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_NOT_FOUND',
            message: 'Relationship not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(relationship.campaign_id, userId) : false;
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

      // Return response
      res.status(200).json({
        success: true,
        data: relationship
      });
    } catch (error) {
      console.error('Error getting relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create relationship
   * @param req Express request
   * @param res Express response
   */
  public async createRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Check if source entity exists
      const sourceEntityExists = await this.entityExists(
        req.body.source_entity_id,
        req.body.source_entity_type,
        req.body.campaign_id
      );
      if (!sourceEntityExists) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SOURCE_ENTITY_NOT_FOUND',
            message: 'Source not found'
          }
        });
        return;
      }

      // Check if target entity exists
      const targetEntityExists = await this.entityExists(
        req.body.target_entity_id,
        req.body.target_entity_type,
        req.body.campaign_id
      );
      if (!targetEntityExists) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TARGET_ENTITY_NOT_FOUND',
            message: 'Target not found'
          }
        });
        return;
      }

      // Create relationship
      const relationship = await this.repositoryFactory.getRelationshipRepository().create({
        campaign_id: req.body.campaign_id,
        source_entity_id: req.body.source_entity_id,
        source_entity_type: req.body.source_entity_type,
        target_entity_id: req.body.target_entity_id,
        target_entity_type: req.body.target_entity_type,
        relationship_type: req.body.relationship_type,
        description: req.body.description,
        created_by: userId || ''
      }, userId || '');

      // Return response
      res.status(201).json({
        success: true,
        data: relationship
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update relationship
   * @param req Express request
   * @param res Express response
   */
  public async updateRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get relationship ID from request parameters
      const relationshipId = req.params.id;

      // Get relationship
      const relationship = await this.repositoryFactory.getRelationshipRepository().findById(relationshipId);

      // Check if relationship exists
      if (!relationship) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_NOT_FOUND',
            message: 'Relationship not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(relationship.campaign_id, userId) : false;
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

      // Update relationship
      const updatedRelationship = await this.repositoryFactory.getRelationshipRepository().update(relationshipId, {
        relationship_type: req.body.relationship_type,
        description: req.body.description
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedRelationship
      });
    } catch (error) {
      console.error('Error updating relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete relationship
   * @param req Express request
   * @param res Express response
   */
  public async deleteRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get relationship ID from request parameters
      const relationshipId = req.params.id;

      // Get relationship
      const relationship = await this.repositoryFactory.getRelationshipRepository().findById(relationshipId);

      // Check if relationship exists
      if (!relationship) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_NOT_FOUND',
            message: 'Relationship not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(relationship.campaign_id, userId) : false;
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

      // Delete relationship
      const deleted = await this.repositoryFactory.getRelationshipRepository().delete(relationshipId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error deleting relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Check if entity exists
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param campaignId Campaign ID
   * @returns True if entity exists, false otherwise
   */
  private async entityExists(entityId: string, entityType: EntityType, campaignId: string): Promise<boolean> {
    switch (entityType) {
      case EntityType.CHARACTER:
        const character = await this.repositoryFactory.getCharacterRepository().findById(entityId);
        return character !== null && character.campaign_id === campaignId;
      case EntityType.LOCATION:
        const location = await this.repositoryFactory.getLocationRepository().findById(entityId);
        return location !== null && location.campaign_id === campaignId;
      case EntityType.EVENT:
        // TODO: Implement event repository
        return false;
      case EntityType.ITEM:
        // TODO: Implement item repository
        return false;
      default:
        return false;
    }
  }
}
