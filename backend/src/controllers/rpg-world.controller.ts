import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { RPGWorld } from '../repositories/rpg-world.repository';
import { validationResult } from 'express-validator';

/**
 * RPG World controller for handling RPG World-related requests
 */
export class RPGWorldController {
  private repositoryFactory: RepositoryFactory;

  constructor(repositoryFactory: RepositoryFactory) {
    this.repositoryFactory = repositoryFactory;
  }

  /**
   * Get all RPG Worlds
   */
  public async getAllRPGWorlds(req: Request, res: Response): Promise<void> {
    try {
      const rpgWorlds = await this.repositoryFactory.getRPGWorldRepository().findAll();
      res.status(200).json({
        success: true,
        data: rpgWorlds
      });
    } catch (error) {
      console.error('Error getting RPG Worlds:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting RPG Worlds'
        }
      });
    }
  }

  /**
   * Get RPG World by ID
   */
  public async getRPGWorldById(req: Request, res: Response): Promise<void> {
    try {
      const rpgWorldId = req.params.id;
      const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().findById(rpgWorldId);
      
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

      res.status(200).json({
        success: true,
        data: rpgWorld
      });
    } catch (error) {
      console.error('Error getting RPG World:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting RPG World'
        }
      });
    }
  }

  /**
   * Create RPG World
   */
  public async createRPGWorld(req: Request, res: Response): Promise<void> {
    try {
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

      const existingRPGWorld = await this.repositoryFactory.getRPGWorldRepository().findByName(req.body.name);
      if (existingRPGWorld) {
        res.status(400).json({
          success: false,
          error: {
            code: 'RPG_WORLD_NAME_EXISTS',
            message: 'RPG World with this name already exists'
          }
        });
        return;
      }

      const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().create({
        name: req.body.name,
        description: req.body.description,
        system_version: req.body.system_version
      });

      res.status(201).json({
        success: true,
        data: rpgWorld
      });
    } catch (error) {
      console.error('Error creating RPG World:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating RPG World'
        }
      });
    }
  }

  /**
   * Update RPG World
   */
  public async updateRPGWorld(req: Request, res: Response): Promise<void> {
    try {
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

      const rpgWorldId = req.params.id;
      const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().findById(rpgWorldId);

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

      if (req.body.name && req.body.name !== rpgWorld.name) {
        const existingRPGWorld = await this.repositoryFactory.getRPGWorldRepository().findByName(req.body.name);
        if (existingRPGWorld && existingRPGWorld.rpg_world_id !== rpgWorldId) {
          res.status(400).json({
            success: false,
            error: {
              code: 'RPG_WORLD_NAME_EXISTS',
              message: 'RPG World with this name already exists'
            }
          });
          return;
        }
      }

      const updatedRPGWorld = await this.repositoryFactory.getRPGWorldRepository().update(rpgWorldId, {
        name: req.body.name,
        description: req.body.description,
        system_version: req.body.system_version
      });

      res.status(200).json({
        success: true,
        data: updatedRPGWorld
      });
    } catch (error) {
      console.error('Error updating RPG World:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating RPG World'
        }
      });
    }
  }

  /**
   * Delete RPG World
   */
  public async deleteRPGWorld(req: Request, res: Response): Promise<void> {
    try {
      const rpgWorldId = req.params.id;
      const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().findById(rpgWorldId);

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

      const campaigns = await this.repositoryFactory.getRPGWorldRepository().getCampaigns(rpgWorldId);
      if (campaigns.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'RPG_WORLD_HAS_CAMPAIGNS',
            message: 'Cannot delete RPG World with associated campaigns'
          }
        });
        return;
      }

      const deleted = await this.repositoryFactory.getRPGWorldRepository().delete(rpgWorldId);

      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error deleting RPG World:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting RPG World'
        }
      });
    }
  }

  /**
   * Get campaigns for RPG World
   */
  public async getCampaignsForRPGWorld(req: Request, res: Response): Promise<void> {
    try {
      const rpgWorldId = req.params.id;
      const rpgWorld = await this.repositoryFactory.getRPGWorldRepository().findById(rpgWorldId);

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

      const campaigns = await this.repositoryFactory.getRPGWorldRepository().getCampaigns(rpgWorldId);

      res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      console.error('Error getting campaigns for RPG World:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting campaigns for RPG World'
        }
      });
    }
  }
}
