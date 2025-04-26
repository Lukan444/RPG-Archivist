import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Power, PowerType } from '../models/power.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
};

/**
 * Power controller for handling power-related requests
 */
export class PowerController {
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
   * Get all powers
   * @param req Express request
   * @param res Express response
   */
  public async getAllPowers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const campaignId = req.query.campaign_id as string;
      const powerType = req.query.power_type as PowerType;

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

      // Get powers
      const { powers, total } = await this.repositoryFactory.getPowerRepository().findAll(
        campaignId,
        page,
        limit,
        req.query.sort as string || 'name',
        req.query.order as 'asc' | 'desc' || 'asc',
        search,
        powerType
      );

      // Return response
      res.status(200).json({
        success: true,
        data: powers,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting powers:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting powers',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get power by ID
   * @param req Express request
   * @param res Express response
   */
  public async getPowerById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get power ID from request parameters
      const powerId = req.params.id;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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
        data: power
      });
    } catch (error) {
      console.error('Error getting power:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting power',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create power
   * @param req Express request
   * @param res Express response
   */
  public async createPower(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Create power
      const power = await this.repositoryFactory.getPowerRepository().create({
        campaign_id: req.body.campaign_id,
        name: req.body.name,
        description: req.body.description,
        power_type: req.body.power_type,
        effect: req.body.effect,
        requirements: req.body.requirements
      }, userId || '');

      // Return response
      res.status(201).json({
        success: true,
        data: power
      });
    } catch (error) {
      console.error('Error creating power:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating power',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update power
   * @param req Express request
   * @param res Express response
   */
  public async updatePower(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get power ID from request parameters
      const powerId = req.params.id;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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

      // Update power
      const updatedPower = await this.repositoryFactory.getPowerRepository().update(powerId, {
        name: req.body.name,
        description: req.body.description,
        power_type: req.body.power_type,
        effect: req.body.effect,
        requirements: req.body.requirements
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedPower
      });
    } catch (error) {
      console.error('Error updating power:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating power',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete power
   * @param req Express request
   * @param res Express response
   */
  public async deletePower(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get power ID from request parameters
      const powerId = req.params.id;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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

      // Delete power
      try {
        const deleted = await this.repositoryFactory.getPowerRepository().delete(powerId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Cannot delete power with associated characters') {
          res.status(400).json({
            success: false,
            error: {
              code: 'POWER_HAS_CHARACTERS',
              message: 'Cannot delete power with associated characters'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting power:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting power',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get characters with power
   * @param req Express request
   * @param res Express response
   */
  public async getCharactersWithPower(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get power ID from request parameters
      const powerId = req.params.id;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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

      // Get characters with power
      const characterPowers = await this.repositoryFactory.getPowerRepository().getCharactersWithPower(powerId);

      // Return response
      res.status(200).json({
        success: true,
        data: characterPowers
      });
    } catch (error) {
      console.error('Error getting characters with power:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting characters with power',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Add power to character
   * @param req Express request
   * @param res Express response
   */
  public async addPowerToCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get power ID and character ID from request parameters
      const powerId = req.params.id;
      const characterId = req.body.character_id;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

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

      // Check if character and power are in the same campaign
      if (character.campaign_id !== power.campaign_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_MISMATCH',
            message: 'Character and power must be in the same campaign'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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

      // Check if character already has power
      const characterPower = await this.repositoryFactory.getPowerRepository().getCharacterPower(characterId, powerId);
      if (characterPower) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CHARACTER_ALREADY_HAS_POWER',
            message: 'Character already has this power'
          }
        });
        return;
      }

      // Add power to character
      const newCharacterPower = await this.repositoryFactory.getPowerRepository().addPowerToCharacter({
        character_id: characterId,
        power_id: powerId,
        proficiency_level: req.body.proficiency_level,
        notes: req.body.notes
      });

      // Return response
      res.status(201).json({
        success: true,
        data: newCharacterPower
      });
    } catch (error) {
      console.error('Error adding power to character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while adding power to character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update character power
   * @param req Express request
   * @param res Express response
   */
  public async updateCharacterPower(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get power ID and character ID from request parameters
      const powerId = req.params.id;
      const characterId = req.params.characterId;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

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

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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

      // Check if character has power
      const characterPower = await this.repositoryFactory.getPowerRepository().getCharacterPower(characterId, powerId);
      if (!characterPower) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_POWER_NOT_FOUND',
            message: 'Character does not have this power'
          }
        });
        return;
      }

      // Update character power
      const updatedCharacterPower = await this.repositoryFactory.getPowerRepository().updateCharacterPower(characterId, powerId, {
        proficiency_level: req.body.proficiency_level,
        notes: req.body.notes
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedCharacterPower
      });
    } catch (error) {
      console.error('Error updating character power:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating character power',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Remove power from character
   * @param req Express request
   * @param res Express response
   */
  public async removePowerFromCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get power ID and character ID from request parameters
      const powerId = req.params.id;
      const characterId = req.params.characterId;

      // Get power
      const power = await this.repositoryFactory.getPowerRepository().findById(powerId);

      // Check if power exists
      if (!power) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POWER_NOT_FOUND',
            message: 'Power not found'
          }
        });
        return;
      }

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

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(power.campaign_id, userId) : false;
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

      // Check if character has power
      const characterPower = await this.repositoryFactory.getPowerRepository().getCharacterPower(characterId, powerId);
      if (!characterPower) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_POWER_NOT_FOUND',
            message: 'Character does not have this power'
          }
        });
        return;
      }

      // Remove power from character
      const deleted = await this.repositoryFactory.getPowerRepository().removePowerFromCharacter(characterId, powerId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error removing power from character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing power from character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
