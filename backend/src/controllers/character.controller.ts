import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Character } from '../models/character.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
}

/**
 * Character controller for handling character-related requests
 */
export class CharacterController {
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
   * Get all characters
   * @param req Express request
   * @param res Express response
   */
  public async getAllCharacters(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const campaignId = req.query.campaign_id as string;
      const isPlayerCharacter = req.query.is_player_character ?
        req.query.is_player_character === 'true' : undefined;
      const characterType = req.query.character_type as string;

      // Get characters
      const { characters, total } = await this.repositoryFactory.getCharacterRepository().findAll(
        campaignId,
        page,
        limit,
        req.query.sort as string || 'name',
        req.query.order as 'asc' | 'desc' || 'asc',
        search,
        isPlayerCharacter,
        characterType
      );

      // Return response
      res.status(200).json({
        success: true,
        data: characters,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting characters:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting characters',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get character by ID
   * @param req Express request
   * @param res Express response
   */
  public async getCharacterById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get character ID from request parameters
      const characterId = req.params.id;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
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

      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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
        data: character
      });
    } catch (error) {
      console.error('Error getting character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create character
   * @param req Express request
   * @param res Express response
   */
  public async createCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(req.body.campaign_id, userId);
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

      // If player_id is provided, check if player exists and is a participant in the campaign
      if (req.body.player_id) {
        const player = await this.repositoryFactory.getUserRepository().findById(req.body.player_id);
        if (!player) {
          res.status(404).json({
            success: false,
            error: {
              code: 'PLAYER_NOT_FOUND',
              message: 'Player not found'
            }
          });
          return;
        }

        const isPlayerParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(req.body.campaign_id, req.body.player_id);
        if (!isPlayerParticipant) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PLAYER_NOT_PARTICIPANT',
              message: 'Player is not a participant in this campaign'
            }
          });
          return;
        }
      }

      // Create character
      const character = await this.repositoryFactory.getCharacterRepository().create({
        campaign_id: req.body.campaign_id,
        name: req.body.name,
        description: req.body.description,
        character_type: req.body.character_type,
        is_player_character: req.body.is_player_character !== undefined ? req.body.is_player_character : false,
        player_id: req.body.player_id
      }, userId);

      // Return response
      res.status(201).json({
        success: true,
        data: character
      });
    } catch (error) {
      console.error('Error creating character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update character
   * @param req Express request
   * @param res Express response
   */
  public async updateCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get character ID from request parameters
      const characterId = req.params.id;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
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

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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

      // If player_id is provided, check if player exists and is a participant in the campaign
      if (req.body.player_id) {
        const player = await this.repositoryFactory.getUserRepository().findById(req.body.player_id);
        if (!player) {
          res.status(404).json({
            success: false,
            error: {
              code: 'PLAYER_NOT_FOUND',
              message: 'Player not found'
            }
          });
          return;
        }

        const isPlayerParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, req.body.player_id);
        if (!isPlayerParticipant) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PLAYER_NOT_PARTICIPANT',
              message: 'Player is not a participant in this campaign'
            }
          });
          return;
        }
      }

      // Update character
      const updatedCharacter = await this.repositoryFactory.getCharacterRepository().update(characterId, {
        name: req.body.name,
        description: req.body.description,
        character_type: req.body.character_type,
        is_player_character: req.body.is_player_character,
        player_id: req.body.player_id
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedCharacter
      });
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete character
   * @param req Express request
   * @param res Express response
   */
  public async deleteCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get character ID from request parameters
      const characterId = req.params.id;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
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

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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

      // Delete character
      try {
        const deleted = await this.repositoryFactory.getCharacterRepository().delete(characterId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Cannot delete character with associated relationships') {
          res.status(400).json({
            success: false,
            error: {
              code: 'CHARACTER_HAS_RELATIONSHIPS',
              message: 'Cannot delete character with associated relationships'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get character relationships
   * @param req Express request
   * @param res Express response
   */
  public async getCharacterRelationships(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get character ID from request parameters
      const characterId = req.params.id;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
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

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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
      const relationships = await this.repositoryFactory.getCharacterRepository().getRelationships(characterId);

      // Return response
      res.status(200).json({
        success: true,
        data: relationships
      });
    } catch (error) {
      console.error('Error getting character relationships:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting character relationships',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create character relationship
   * @param req Express request
   * @param res Express response
   */
  public async createCharacterRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get character ID from request parameters
      const characterId = req.params.id;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
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

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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

      // Check if target character exists
      const targetCharacter = await this.repositoryFactory.getCharacterRepository().findById(req.body.target_character_id);
      if (!targetCharacter) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TARGET_CHARACTER_NOT_FOUND',
            message: 'Target character not found'
          }
        });
        return;
      }

      // Check if target character is in the same campaign
      if (targetCharacter.campaign_id !== character.campaign_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TARGET_CHARACTER_NOT_IN_CAMPAIGN',
            message: 'Target character is not in the same campaign'
          }
        });
        return;
      }

      // Create relationship
      const relationship = await this.repositoryFactory.getCharacterRepository().createRelationship({
        source_character_id: characterId,
        target_character_id: req.body.target_character_id,
        relationship_type: req.body.relationship_type,
        description: req.body.description
      });

      // Return response
      res.status(201).json({
        success: true,
        data: relationship
      });
    } catch (error) {
      console.error('Error creating character relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating character relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update character relationship
   * @param req Express request
   * @param res Express response
   */
  public async updateCharacterRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get character ID and relationship ID from request parameters
      const characterId = req.params.id;
      const relationshipId = req.params.relationshipId;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
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

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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

      // Get relationship
      const relationship = await this.repositoryFactory.getCharacterRepository().getRelationshipById(relationshipId);

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

      // Check if relationship belongs to character
      if (relationship.source_character_id !== characterId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_NOT_OWNED',
            message: 'Relationship does not belong to this character'
          }
        });
        return;
      }

      // Update relationship
      const updatedRelationship = await this.repositoryFactory.getCharacterRepository().updateRelationship(relationshipId, {
        relationship_type: req.body.relationship_type,
        description: req.body.description
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedRelationship
      });
    } catch (error) {
      console.error('Error updating character relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating character relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete character relationship
   * @param req Express request
   * @param res Express response
   */
  public async deleteCharacterRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get character ID and relationship ID from request parameters
      const characterId = req.params.id;
      const relationshipId = req.params.relationshipId;

      // Get character
      const character = await this.repositoryFactory.getCharacterRepository().findById(characterId);

      // Check if character exists
      if (!character) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_NOT_FOUND',
            message: 'Character not found'
          }
        });
        return;
      }

      // Get user ID from request
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

      // Check if user is participant in campaign
      const isParticipant = await this.repositoryFactory.getCampaignRepository().isParticipant(character.campaign_id, userId);
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

      // Get relationship
      const relationship = await this.repositoryFactory.getCharacterRepository().getRelationshipById(relationshipId);

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

      // Check if relationship belongs to character
      if (relationship.source_character_id !== characterId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'RELATIONSHIP_NOT_OWNED',
            message: 'Relationship does not belong to this character'
          }
        });
        return;
      }

      // Delete relationship
      const deleted = await this.repositoryFactory.getCharacterRepository().deleteRelationship(relationshipId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error deleting character relationship:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting character relationship',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
