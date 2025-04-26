import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { Location } from '../models/location.model';
import { validationResult } from 'express-validator';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role?: string;
  };
}

/**
 * Location controller for handling location-related requests
 */
export class LocationController {
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
   * Get all locations
   * @param req Express request
   * @param res Express response
   */
  public async getAllLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const campaignId = req.query.campaign_id as string;
      const locationType = req.query.location_type as string;
      const parentLocationId = req.query.parent_location_id as string;

      // Get locations
      const { locations, total } = await this.repositoryFactory.getLocationRepository().findAll({
        campaignId,
        parentId: parentLocationId,
        page,
        limit,
        search
      });

      // Return response
      res.status(200).json({
        success: true,
        data: locations,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting locations:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting locations',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Get location by ID
   * @param req Express request
   * @param res Express response
   */
  public async getLocationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get location ID from request parameters
      const locationId = req.params.id;

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

      // Check if user is participant in campaign
      const userId = req.user?.user_id;
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(location.campaign_id, userId) : false;
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
        data: location
      });
    } catch (error) {
      console.error('Error getting location:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting location',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Create location
   * @param req Express request
   * @param res Express response
   */
  public async createLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // If parent_location_id is provided, check if parent location exists and is in the same campaign
      if (req.body.parent_location_id) {
        const parentLocation = await this.repositoryFactory.getLocationRepository().findById(req.body.parent_location_id);
        if (!parentLocation) {
          res.status(404).json({
            success: false,
            error: {
              code: 'PARENT_LOCATION_NOT_FOUND',
              message: 'Parent location not found'
            }
          });
          return;
        }

        if (parentLocation.campaign_id !== req.body.campaign_id) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PARENT_LOCATION_NOT_IN_CAMPAIGN',
              message: 'Parent location is not in the same campaign'
            }
          });
          return;
        }
      }

      // Create location
      const now = new Date().toISOString();
      const location = await this.repositoryFactory.getLocationRepository().create({
        campaign_id: req.body.campaign_id,
        name: req.body.name,
        description: req.body.description,
        location_type: req.body.location_type,
        parent_location_id: req.body.parent_location_id,
        created_at: now,
        created_by: userId || 'system'
      });

      // Return response
      res.status(201).json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating location',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Update location
   * @param req Express request
   * @param res Express response
   */
  public async updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Get location ID from request parameters
      const locationId = req.params.id;

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
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(location.campaign_id, userId) : false;
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

      // If parent_location_id is provided, check if parent location exists and is in the same campaign
      if (req.body.parent_location_id) {
        // Check if parent_location_id is the same as locationId
        if (req.body.parent_location_id === locationId) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_PARENT_LOCATION',
              message: 'A location cannot be its own parent'
            }
          });
          return;
        }

        const parentLocation = await this.repositoryFactory.getLocationRepository().findById(req.body.parent_location_id);
        if (!parentLocation) {
          res.status(404).json({
            success: false,
            error: {
              code: 'PARENT_LOCATION_NOT_FOUND',
              message: 'Parent location not found'
            }
          });
          return;
        }

        if (parentLocation.campaign_id !== location.campaign_id) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PARENT_LOCATION_NOT_IN_CAMPAIGN',
              message: 'Parent location is not in the same campaign'
            }
          });
          return;
        }

        // Check for circular references
        const isCircular = await this.repositoryFactory.getLocationRepository().checkCircularReference(locationId, req.body.parent_location_id);
        if (isCircular) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CIRCULAR_REFERENCE',
              message: 'Setting this parent would create a circular reference'
            }
          });
          return;
        }
      }

      // Update location
      const updatedLocation = await this.repositoryFactory.getLocationRepository().update(locationId, {
        name: req.body.name,
        description: req.body.description,
        location_type: req.body.location_type,
        parent_location_id: req.body.parent_location_id
      });

      // Return response
      res.status(200).json({
        success: true,
        data: updatedLocation
      });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating location',
          details: this.getErrorMessage(error)
        }
      });
    }
  }

  /**
   * Delete location
   * @param req Express request
   * @param res Express response
   */
  public async deleteLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get location ID from request parameters
      const locationId = req.params.id;

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
      const isParticipant = userId ? await this.repositoryFactory.getCampaignRepository().isParticipant(location.campaign_id, userId) : false;
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

      // Delete location
      try {
        const deleted = await this.repositoryFactory.getLocationRepository().delete(locationId);

        // Return response
        res.status(200).json({
          success: true,
          data: {
            deleted
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Cannot delete location with child locations') {
            res.status(400).json({
              success: false,
              error: {
                code: 'LOCATION_HAS_CHILDREN',
                message: 'Cannot delete location with child locations'
              }
            });
          } else if (error.message === 'Cannot delete location with associated relationships') {
            res.status(400).json({
              success: false,
              error: {
                code: 'LOCATION_HAS_RELATIONSHIPS',
                message: 'Cannot delete location with associated relationships'
              }
            });
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting location',
          details: this.getErrorMessage(error)
        }
      });
    }
  }
}
