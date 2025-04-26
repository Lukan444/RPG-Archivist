import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Item, ItemType, ItemRarity } from '../models/item.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
}

/**
 * Item controller for handling item-related requests
 */
export class ItemController {
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
   * Get all items
   * @param req Express request
   * @param res Express response
   */
  public async getAllItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const campaignId = req.query.campaign_id as string;
      const itemType = req.query.item_type as ItemType;
      const rarity = req.query.rarity as ItemRarity;

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

      // Get items
      const { items, total } = await this.repositoryFactory.getItemRepository().findAll(
        campaignId,
        page,
        limit,
        req.query.sort as string || 'name',
        req.query.order as 'asc' | 'desc' || 'asc',
        search,
        itemType,
        rarity
      );

      // Return response
      res.status(200).json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting items:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting items',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get item by ID
   * @param req Express request
   * @param res Express response
   */
  public async getItemById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get item ID from request parameters
      const itemId = req.params.id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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
        data: item
      });
    } catch (error) {
      console.error('Error getting item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create item
   * @param req Express request
   * @param res Express response
   */
  public async createItem(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Create item
      const item = await this.repositoryFactory.getItemRepository().create({
        campaign_id: req.body.campaign_id,
        name: req.body.name,
        description: req.body.description,
        item_type: req.body.item_type,
        rarity: req.body.rarity,
        value: req.body.value,
        weight: req.body.weight,
        properties: req.body.properties
      }, userId || 'system');

      // Return response
      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update item
   * @param req Express request
   * @param res Express response
   */
  public async updateItem(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get item ID from request parameters
      const itemId = req.params.id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Update item
      const updatedItem = await this.repositoryFactory.getItemRepository().update(itemId, {
        name: req.body.name,
        description: req.body.description,
        item_type: req.body.item_type,
        rarity: req.body.rarity,
        value: req.body.value,
        weight: req.body.weight,
        properties: req.body.properties
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedItem
      });
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete item
   * @param req Express request
   * @param res Express response
   */
  public async deleteItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get item ID from request parameters
      const itemId = req.params.id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Delete item
      try {
        const deleted = await this.repositoryFactory.getItemRepository().delete(itemId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Cannot delete item with associated characters or locations') {
          res.status(400).json({
            success: false,
            error: {
              code: 'ITEM_HAS_ASSOCIATIONS',
              message: 'Cannot delete item with associated characters or locations'
            }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get characters with item
   * @param req Express request
   * @param res Express response
   */
  public async getCharactersWithItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get item ID from request parameters
      const itemId = req.params.id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Get characters with item
      const characterItems = await this.repositoryFactory.getItemRepository().getCharactersWithItem(itemId);

      // Return response
      res.status(200).json({
        success: true,
        data: characterItems
      });
    } catch (error) {
      console.error('Error getting characters with item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting characters with item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Add item to character
   * @param req Express request
   * @param res Express response
   */
  public async addItemToCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get item ID and character ID from request parameters
      const itemId = req.params.id;
      const characterId = req.body.character_id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
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

      // Check if character and item are in the same campaign
      if (character.campaign_id !== item.campaign_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_MISMATCH',
            message: 'Character and item must be in the same campaign'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Check if character already has item
      const characterItem = await this.repositoryFactory.getItemRepository().getCharacterItem(characterId, itemId);
      if (characterItem) {
        // Update quantity instead of creating a new entry
        const updatedCharacterItem = await this.repositoryFactory.getItemRepository().updateCharacterItem(characterId, itemId, {
          quantity: characterItem.quantity + (req.body.quantity || 1),
          notes: req.body.notes || characterItem.notes,
          is_equipped: req.body.is_equipped !== undefined ? req.body.is_equipped : characterItem.is_equipped
        });

        // Return response
        res.status(200).json({
          success: true,
          data: updatedCharacterItem
        });
        return;
      }

      // Add item to character
      const newCharacterItem = await this.repositoryFactory.getItemRepository().addItemToCharacter({
        character_id: characterId,
        item_id: itemId,
        quantity: req.body.quantity || 1,
        notes: req.body.notes,
        is_equipped: req.body.is_equipped || false
      });

      // Return response
      res.status(201).json({
        success: true,
        data: newCharacterItem
      });
    } catch (error) {
      console.error('Error adding item to character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while adding item to character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update character item
   * @param req Express request
   * @param res Express response
   */
  public async updateCharacterItem(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get item ID and character ID from request parameters
      const itemId = req.params.id;
      const characterId = req.params.characterId;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
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
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Check if character has item
      const characterItem = await this.repositoryFactory.getItemRepository().getCharacterItem(characterId, itemId);
      if (!characterItem) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_ITEM_NOT_FOUND',
            message: 'Character does not have this item'
          }
        });
        return;
      }

      // Update character item
      const updatedCharacterItem = await this.repositoryFactory.getItemRepository().updateCharacterItem(characterId, itemId, {
        quantity: req.body.quantity,
        notes: req.body.notes,
        is_equipped: req.body.is_equipped
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedCharacterItem
      });
    } catch (error) {
      console.error('Error updating character item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating character item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Remove item from character
   * @param req Express request
   * @param res Express response
   */
  public async removeItemFromCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get item ID and character ID from request parameters
      const itemId = req.params.id;
      const characterId = req.params.characterId;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
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
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Check if character has item
      const characterItem = await this.repositoryFactory.getItemRepository().getCharacterItem(characterId, itemId);
      if (!characterItem) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHARACTER_ITEM_NOT_FOUND',
            message: 'Character does not have this item'
          }
        });
        return;
      }

      // Remove item from character
      const deleted = await this.repositoryFactory.getItemRepository().removeItemFromCharacter(characterId, itemId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error removing item from character:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing item from character',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get locations with item
   * @param req Express request
   * @param res Express response
   */
  public async getLocationsWithItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get item ID from request parameters
      const itemId = req.params.id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Get locations with item
      const locationItems = await this.repositoryFactory.getItemRepository().getLocationsWithItem(itemId);

      // Return response
      res.status(200).json({
        success: true,
        data: locationItems
      });
    } catch (error) {
      console.error('Error getting locations with item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting locations with item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Add item to location
   * @param req Express request
   * @param res Express response
   */
  public async addItemToLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get item ID and location ID from request parameters
      const itemId = req.params.id;
      const locationId = req.body.location_id;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get location
      const location = await this.repositoryFactory.getLocationRepository().findById(locationId);

      // Check if location exists
      if (!location) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'Location not found'
          }
        });
        return;
      }

      // Check if location and item are in the same campaign
      if (location.campaign_id !== item.campaign_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CAMPAIGN_MISMATCH',
            message: 'Location and item must be in the same campaign'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Check if location already has item
      const locationItem = await this.repositoryFactory.getItemRepository().getLocationItem(locationId, itemId);
      if (locationItem) {
        // Update quantity instead of creating a new entry
        const updatedLocationItem = await this.repositoryFactory.getItemRepository().updateLocationItem(locationId, itemId, {
          quantity: locationItem.quantity + (req.body.quantity || 1),
          notes: req.body.notes || locationItem.notes
        });

        // Return response
        res.status(200).json({
          success: true,
          data: updatedLocationItem
        });
        return;
      }

      // Add item to location
      const newLocationItem = await this.repositoryFactory.getItemRepository().addItemToLocation({
        location_id: locationId,
        item_id: itemId,
        quantity: req.body.quantity || 1,
        notes: req.body.notes
      });

      // Return response
      res.status(201).json({
        success: true,
        data: newLocationItem
      });
    } catch (error) {
      console.error('Error adding item to location:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while adding item to location',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update location item
   * @param req Express request
   * @param res Express response
   */
  public async updateLocationItem(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get item ID and location ID from request parameters
      const itemId = req.params.id;
      const locationId = req.params.locationId;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get location
      const location = await this.repositoryFactory.getLocationRepository().findById(locationId);

      // Check if location exists
      if (!location) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'Location not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Check if location has item
      const locationItem = await this.repositoryFactory.getItemRepository().getLocationItem(locationId, itemId);
      if (!locationItem) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_ITEM_NOT_FOUND',
            message: 'Location does not have this item'
          }
        });
        return;
      }

      // Update location item
      const updatedLocationItem = await this.repositoryFactory.getItemRepository().updateLocationItem(locationId, itemId, {
        quantity: req.body.quantity,
        notes: req.body.notes
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedLocationItem
      });
    } catch (error) {
      console.error('Error updating location item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating location item',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Remove item from location
   * @param req Express request
   * @param res Express response
   */
  public async removeItemFromLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get item ID and location ID from request parameters
      const itemId = req.params.id;
      const locationId = req.params.locationId;

      // Get item
      const item = await this.repositoryFactory.getItemRepository().findById(itemId);

      // Check if item exists
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found'
          }
        });
        return;
      }

      // Get location
      const location = await this.repositoryFactory.getLocationRepository().findById(locationId);

      // Check if location exists
      if (!location) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'Location not found'
          }
        });
        return;
      }

      // Get user ID from request
      const userId = req.user?.user_id;

      // Check if user is participant in campaign
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(item.campaign_id, userId) : false;
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

      // Check if location has item
      const locationItem = await this.repositoryFactory.getItemRepository().getLocationItem(locationId, itemId);
      if (!locationItem) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_ITEM_NOT_FOUND',
            message: 'Location does not have this item'
          }
        });
        return;
      }

      // Remove item from location
      const deleted = await this.repositoryFactory.getItemRepository().removeItemFromLocation(locationId, itemId);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error removing item from location:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while removing item from location',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
