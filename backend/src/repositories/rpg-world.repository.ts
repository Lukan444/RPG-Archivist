import { BaseRepository } from './base.repository';
import { RPGWorld } from '../models/rpg-world.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for RPG World entities
 */
export class RPGWorldRepository extends BaseRepository {
  /**
   * Create a new RPG World
   * @param rpgWorld RPG World to create
   * @returns Created RPG World
   */
  async create(rpgWorld: Omit<RPGWorld, 'world_id'>): Promise<RPGWorld> {
    try {
      // Generate ID if not provided
      const worldId = uuidv4();

      const newWorld: RPGWorld = {
        ...rpgWorld,
        world_id: worldId
      };

      const query = `
        CREATE (w:RPGWorld $world)
        RETURN w {.*} as world
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { world: newWorld });
        return result.records[0].get('world');
      });

      return result;
    } catch (error) {
      console.error('Error creating RPG World:', error);
      throw error;
    }
  }

  /**
   * Get RPG World by ID
   * @param worldId RPG World ID
   * @returns RPG World
   */
  async getById(worldId: string): Promise<RPGWorld | null> {
    try {
      const query = `
        MATCH (w:RPGWorld {world_id: $worldId})
        RETURN w {.*} as world
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { worldId });
        return result.records.length > 0 ? result.records[0].get('world') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting RPG World by ID:', error);
      throw error;
    }
  }

  /**
   * Get all RPG Worlds
   * @param userId Optional user ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param search Search term
   * @returns RPG Worlds and total count
   */
  async getAll(
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ worlds: RPGWorld[]; total: number }> {
    try {
      let query = `
        MATCH (w:RPGWorld)
      `;

      // Add user filter if provided
      if (userId) {
        query += `
          MATCH (u:User {user_id: $userId})
          MATCH (w)<-[:CREATED]-(u)
        `;
      }

      // Add search filter if provided
      if (search) {
        query += `
          WHERE w.name CONTAINS $search OR w.description CONTAINS $search
        `;
      }

      // Count total worlds
      const countQuery = query + `
        RETURN COUNT(w) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          userId,
          search
        });
        return result.records[0].get('total').toNumber();
      });

      // Get worlds with pagination
      query += `
        RETURN w {.*} as world
        ORDER BY w.name
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const worldsResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          userId,
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('world'));
      });

      return {
        worlds: worldsResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error getting all RPG Worlds:', error);
      throw error;
    }
  }

  /**
   * Update RPG World
   * @param worldId RPG World ID
   * @param rpgWorld RPG World data to update
   * @returns Updated RPG World
   */
  async update(worldId: string, rpgWorld: Partial<RPGWorld>): Promise<RPGWorld> {
    try {
      const query = `
        MATCH (w:RPGWorld {world_id: $worldId})
        SET w += $world
        RETURN w {.*} as world
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          worldId,
          world: rpgWorld
        });

        if (result.records.length === 0) {
          throw new Error(`RPG World with ID ${worldId} not found`);
        }

        return result.records[0].get('world');
      });

      return result;
    } catch (error) {
      console.error('Error updating RPG World:', error);
      throw error;
    }
  }

  /**
   * Delete RPG World
   * @param worldId RPG World ID
   * @returns True if deleted
   */
  async delete(worldId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (w:RPGWorld {world_id: $worldId})
        DETACH DELETE w
        RETURN count(w) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { worldId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting RPG World:', error);
      throw error;
    }
  }

  /**
   * Find RPG World by name
   * @param name RPG World name
   * @returns RPG World or null if not found
   */
  async findByName(name: string): Promise<RPGWorld | null> {
    try {
      const query = `
        MATCH (w:RPGWorld)
        WHERE w.name = $name
        RETURN w {.*} as world
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { name });
        return result.records.length > 0 ? result.records[0].get('world') : null;
      });

      return result;
    } catch (error) {
      console.error('Error finding RPG World by name:', error);
      throw error;
    }
  }

  /**
   * Find RPG World by ID
   * @param worldId RPG World ID
   * @returns RPG World or null if not found
   */
  async findById(worldId: string): Promise<RPGWorld | null> {
    return this.getById(worldId);
  }

  /**
   * Get all RPG Worlds
   * @returns Array of RPG Worlds
   */
  async findAll(): Promise<RPGWorld[]> {
    try {
      const { worlds } = await this.getAll(undefined, 1, 1000);
      return worlds;
    } catch (error) {
      console.error('Error finding all RPG Worlds:', error);
      throw error;
    }
  }

  /**
   * Get campaigns associated with an RPG World
   * @param worldId RPG World ID
   * @returns Array of campaigns
   */
  async getCampaigns(worldId: string): Promise<any[]> {
    try {
      const query = `
        MATCH (w:RPGWorld {world_id: $worldId})<-[:USES_WORLD]-(c:Campaign)
        RETURN c {.*} as campaign
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { worldId });
        return result.records.map(record => record.get('campaign'));
      });

      return result;
    } catch (error) {
      console.error('Error getting campaigns for RPG World:', error);
      throw error;
    }
  }
}
