import { BaseRepository } from './base.repository';
import { Location } from '../models/location.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for Location entities
 */
export class LocationRepository extends BaseRepository {
  /**
   * Create a new Location
   * @param location Location to create
   * @returns Created Location
   */
  async create(location: Omit<Location, 'location_id'>): Promise<Location> {
    try {
      // Generate ID if not provided
      const locationId = uuidv4();

      const newLocation: Location = {
        ...location,
        location_id: locationId
      };

      const query = `
        CREATE (l:Location $location)
        RETURN l {.*} as location
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { location: newLocation });
        return result.records[0].get('location');
      });

      // Create relationship to Campaign if campaignId is provided
      if (location.campaign_id) {
        await this.createCampaignRelationship(locationId, location.campaign_id);
      }

      // Create relationship to parent Location if parent_location_id is provided
      if (location.parent_location_id) {
        await this.createParentRelationship(locationId, location.parent_location_id);
      }

      return result;
    } catch (error) {
      console.error('Error creating Location:', error);
      throw error;
    }
  }

  /**
   * Create relationship between Location and Campaign
   * @param locationId Location ID
   * @param campaignId Campaign ID
   */
  async createCampaignRelationship(locationId: string, campaignId: string): Promise<void> {
    try {
      const query = `
        MATCH (l:Location {location_id: $locationId})
        MATCH (c:Campaign {campaign_id: $campaignId})
        MERGE (l)-[:BELONGS_TO]->(c)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { locationId, campaignId });
      });
    } catch (error) {
      console.error('Error creating Location-Campaign relationship:', error);
      throw error;
    }
  }

  /**
   * Create relationship between Location and parent Location
   * @param locationId Location ID
   * @param parentId Parent Location ID
   */
  async createParentRelationship(locationId: string, parentId: string): Promise<void> {
    try {
      const query = `
        MATCH (l:Location {location_id: $locationId})
        MATCH (p:Location {location_id: $parentId})
        MERGE (l)-[:LOCATED_IN]->(p)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { locationId, parentId });
      });
    } catch (error) {
      console.error('Error creating Location-Parent relationship:', error);
      throw error;
    }
  }

  /**
   * Get Location by ID
   * @param locationId Location ID
   * @returns Location
   */
  async getById(locationId: string): Promise<Location | null> {
    try {
      const query = `
        MATCH (l:Location {location_id: $locationId})
        OPTIONAL MATCH (l)-[:BELONGS_TO]->(c:Campaign)
        OPTIONAL MATCH (l)-[:LOCATED_IN]->(p:Location)
        RETURN l {
          .*,
          campaign_id: c.campaign_id,
          parent_location_id: p.location_id
        } as location
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { locationId });
        return result.records.length > 0 ? result.records[0].get('location') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting Location by ID:', error);
      throw error;
    }
  }

  /**
   * Get all Locations
   * @param campaignId Optional campaign ID to filter by
   * @param parentId Optional parent location ID to filter by
   * @param userId Optional user ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param search Search term
   * @returns Locations and total count
   */
  async getAll(
    campaignId?: string,
    parentId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ locations: Location[]; total: number }> {
    try {
      let query = `
        MATCH (l:Location)
      `;

      // Add campaign filter if provided
      if (campaignId) {
        query += `
          MATCH (l)-[:BELONGS_TO]->(c:Campaign {campaign_id: $campaignId})
        `;
      }

      // Add parent filter if provided
      if (parentId) {
        query += `
          MATCH (l)-[:LOCATED_IN]->(p:Location {location_id: $parentId})
        `;
      } else if (parentId === null) {
        // If parentId is explicitly null, get top-level locations
        query += `
          NOT EXISTS { MATCH (l)-[:LOCATED_IN]->(:Location) }
        `;
      }

      // Add user filter if provided
      if (userId) {
        query += `
          MATCH (u:User {user_id: $userId})
          MATCH (l)<-[:CREATED]-(u)
        `;
      }

      // Add search filter if provided
      if (search) {
        query += `
          WHERE l.name CONTAINS $search OR l.description CONTAINS $search
        `;
      }

      // Count total locations
      const countQuery = query + `
        RETURN COUNT(l) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          campaignId,
          parentId,
          userId,
          search
        });
        return result.records[0].get('total').toNumber();
      });

      // Get locations with pagination
      query += `
        OPTIONAL MATCH (l)-[:BELONGS_TO]->(c:Campaign)
        OPTIONAL MATCH (l)-[:LOCATED_IN]->(p:Location)
        RETURN l {
          .*,
          campaign_id: c.campaign_id,
          parent_location_id: p.location_id
        } as location
        ORDER BY l.name
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const locationsResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId,
          parentId,
          userId,
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('location'));
      });

      return {
        locations: locationsResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error getting all Locations:', error);
      throw error;
    }
  }

  /**
   * Update Location
   * @param locationId Location ID
   * @param location Location data to update
   * @returns Updated Location
   */
  async update(locationId: string, location: Partial<Location>): Promise<Location> {
    try {
      // Handle campaign_id and parent_location_id separately
      const { campaign_id, parent_location_id, ...locationData } = location;

      const query = `
        MATCH (l:Location {location_id: $locationId})
        SET l += $location
        RETURN l {.*} as location
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          locationId,
          location: locationData
        });

        if (result.records.length === 0) {
          throw new Error(`Location with ID ${locationId} not found`);
        }

        return result.records[0].get('location');
      });

      // Update campaign relationship if campaign_id is provided
      if (campaign_id !== undefined) {
        // Remove existing relationship
        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(`
            MATCH (l:Location {location_id: $locationId})-[r:BELONGS_TO]->(:Campaign)
            DELETE r
          `, { locationId });
        });

        // Create new relationship if campaign_id is not null
        if (campaign_id) {
          await this.createCampaignRelationship(locationId, campaign_id);
        }
      }

      // Update parent relationship if parent_location_id is provided
      if (parent_location_id !== undefined) {
        // Remove existing relationship
        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(`
            MATCH (l:Location {location_id: $locationId})-[r:LOCATED_IN]->(:Location)
            DELETE r
          `, { locationId });
        });

        // Create new relationship if parent_location_id is not null
        if (parent_location_id) {
          await this.createParentRelationship(locationId, parent_location_id);
        }
      }

      // Get updated location with campaign_id and parent_id
      return await this.getById(locationId) as Location;
    } catch (error) {
      console.error('Error updating Location:', error);
      throw error;
    }
  }

  /**
   * Delete Location
   * @param locationId Location ID
   * @returns True if deleted
   */
  async delete(locationId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (l:Location {location_id: $locationId})
        DETACH DELETE l
        RETURN count(l) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { locationId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting Location:', error);
      throw error;
    }
  }

  /**
   * Find Location by ID
   * @param locationId Location ID
   * @returns Location or null if not found
   */
  async findById(locationId: string): Promise<Location | null> {
    return this.getById(locationId);
  }

  /**
   * Find all Locations
   * @param options Optional parameters for filtering
   * @returns Array of Locations and total count
   */
  async findAll(options: {
    campaignId?: string;
    parentId?: string;
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ locations: Location[]; total: number }> {
    const { campaignId, parentId, userId, page = 1, limit = 10, search } = options;
    return this.getAll(campaignId, parentId, userId, page, limit, search);
  }

  /**
   * Check if a location has child locations
   * @param locationId Location ID
   * @returns True if location has children
   */
  async hasChildren(locationId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (l:Location {location_id: $locationId})<-[:LOCATED_IN]-(child:Location)
        RETURN count(child) as count
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { locationId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error checking if location has children:', error);
      throw error;
    }
  }

  /**
   * Check if adding a parent would create a circular reference
   * @param locationId Location ID
   * @param parentId Parent Location ID
   * @returns True if circular reference would be created
   */
  async checkCircularReference(locationId: string, parentId: string): Promise<boolean> {
    try {
      // Check if parentId is a descendant of locationId
      const query = `
        MATCH (start:Location {location_id: $parentId}), (end:Location {location_id: $locationId})
        RETURN EXISTS(
          (start)-[:LOCATED_IN*]->(end)
        ) as isCircular
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { locationId, parentId });
        return result.records[0].get('isCircular');
      });

      return result;
    } catch (error) {
      console.error('Error checking for circular reference:', error);
      throw error;
    }
  }
}
