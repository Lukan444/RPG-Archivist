import { BaseRepository } from './base.repository';
import { Campaign } from '../models/campaign.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for Campaign entities
 */
export class CampaignRepository extends BaseRepository {
  /**
   * Create a new Campaign
   * @param campaign Campaign to create
   * @returns Created Campaign
   */
  async create(campaign: Omit<Campaign, 'campaign_id'>): Promise<Campaign> {
    try {
      // Generate ID if not provided
      const campaignId = uuidv4();

      const newCampaign: Campaign = {
        ...campaign,
        campaign_id: campaignId
      };

      const query = `
        CREATE (c:Campaign $campaign)
        RETURN c {.*} as campaign
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { campaign: newCampaign });
        return result.records[0].get('campaign');
      });

      // Create relationship to RPG World if worldId is provided
      if (campaign.world_id) {
        await this.createWorldRelationship(campaignId, campaign.world_id);
      }

      return result;
    } catch (error) {
      console.error('Error creating Campaign:', error);
      throw error;
    }
  }

  /**
   * Create relationship between Campaign and RPG World
   * @param campaignId Campaign ID
   * @param worldId RPG World ID
   */
  async createWorldRelationship(campaignId: string, worldId: string): Promise<void> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (w:RPGWorld {world_id: $worldId})
        MERGE (c)-[:PART_OF]->(w)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { campaignId, worldId });
      });
    } catch (error) {
      console.error('Error creating Campaign-World relationship:', error);
      throw error;
    }
  }

  /**
   * Get Campaign by ID
   * @param campaignId Campaign ID
   * @returns Campaign
   */
  async getById(campaignId: string): Promise<Campaign | null> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        OPTIONAL MATCH (c)-[:PART_OF]->(w:RPGWorld)
        RETURN c {
          .*,
          world_id: w.world_id
        } as campaign
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.length > 0 ? result.records[0].get('campaign') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting Campaign by ID:', error);
      throw error;
    }
  }

  /**
   * Get all Campaigns
   * @param worldId Optional world ID to filter by
   * @param userId Optional user ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param search Search term
   * @returns Campaigns and total count
   */
  async getAll(
    worldId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    try {
      let query = `
        MATCH (c:Campaign)
      `;

      // Add world filter if provided
      if (worldId) {
        query += `
          MATCH (c)-[:PART_OF]->(w:RPGWorld {world_id: $worldId})
        `;
      }

      // Add user filter if provided
      if (userId) {
        query += `
          MATCH (u:User {user_id: $userId})
          MATCH (c)<-[:CREATED]-(u)
        `;
      }

      // Add search filter if provided
      if (search) {
        query += `
          WHERE c.name CONTAINS $search OR c.description CONTAINS $search
        `;
      }

      // Count total campaigns
      const countQuery = query + `
        RETURN COUNT(c) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          worldId,
          userId,
          search
        });
        return result.records[0].get('total').toNumber();
      });

      // Get campaigns with pagination
      query += `
        OPTIONAL MATCH (c)-[:PART_OF]->(w:RPGWorld)
        RETURN c {
          .*,
          world_id: w.world_id
        } as campaign
        ORDER BY c.name
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const campaignsResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          worldId,
          userId,
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('campaign'));
      });

      return {
        campaigns: campaignsResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error getting all Campaigns:', error);
      throw error;
    }
  }

  /**
   * Update Campaign
   * @param campaignId Campaign ID
   * @param campaign Campaign data to update
   * @returns Updated Campaign
   */
  async update(campaignId: string, campaign: Partial<Campaign>): Promise<Campaign> {
    try {
      // Handle world_id separately
      const { world_id, ...campaignData } = campaign;

      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        SET c += $campaign
        RETURN c {.*} as campaign
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId,
          campaign: campaignData
        });

        if (result.records.length === 0) {
          throw new Error(`Campaign with ID ${campaignId} not found`);
        }

        return result.records[0].get('campaign');
      });

      // Update world relationship if world_id is provided
      if (world_id !== undefined) {
        // Remove existing relationship
        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(`
            MATCH (c:Campaign {campaign_id: $campaignId})-[r:PART_OF]->(:RPGWorld)
            DELETE r
          `, { campaignId });
        });

        // Create new relationship if world_id is not null
        if (world_id) {
          await this.createWorldRelationship(campaignId, world_id);
        }
      }

      // Get updated campaign with world_id
      return await this.getById(campaignId) as Campaign;
    } catch (error) {
      console.error('Error updating Campaign:', error);
      throw error;
    }
  }

  /**
   * Delete Campaign
   * @param campaignId Campaign ID
   * @returns True if deleted
   */
  async delete(campaignId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        DETACH DELETE c
        RETURN count(c) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting Campaign:', error);
      throw error;
    }
  }

  /**
   * Find Campaign by ID
   * @param campaignId Campaign ID
   * @returns Campaign or null if not found
   */
  async findById(campaignId: string): Promise<Campaign | null> {
    return this.getById(campaignId);
  }

  /**
   * Find all campaigns with pagination and filtering options
   * @param userId User ID to filter by
   * @param worldId World ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param sort Sort field
   * @param order Sort order
   * @param search Search term
   * @returns Campaigns and total count
   */
  async findAll(
    userId?: string,
    worldId?: string,
    page: number = 1,
    limit: number = 10,
    sort: string = 'created_at',
    order: 'asc' | 'desc' = 'desc',
    search?: string
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    try {
      let query = `
        MATCH (c:Campaign)
      `;

      // Add world filter if provided
      if (worldId) {
        query += `
          MATCH (c)-[:PART_OF]->(w:RPGWorld {world_id: $worldId})
        `;
      }

      // Add user filter if provided
      if (userId) {
        query += `
          MATCH (u:User {user_id: $userId})
          MATCH (c)<-[:PARTICIPATES_IN|CREATED]-(u)
        `;
      }

      // Add search filter if provided
      if (search) {
        query += `
          WHERE c.name CONTAINS $search OR c.description CONTAINS $search
        `;
      }

      // Count total campaigns
      const countQuery = query + `
        RETURN COUNT(c) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          worldId,
          userId,
          search
        });
        return result.records[0].get('total').toNumber();
      });

      // Get campaigns with pagination
      query += `
        OPTIONAL MATCH (c)-[:PART_OF]->(w:RPGWorld)
        RETURN c {
          .*,
          world_id: w.world_id
        } as campaign
        ORDER BY c.${sort} ${order}
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const campaignsResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          worldId,
          userId,
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('campaign'));
      });

      return {
        campaigns: campaignsResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error finding all Campaigns:', error);
      throw error;
    }
  }

  /**
   * Find campaign by name and world ID
   * @param name Campaign name
   * @param worldId World ID
   * @returns Campaign or null if not found
   */
  async findByName(name: string, worldId: string): Promise<Campaign | null> {
    try {
      const query = `
        MATCH (c:Campaign {name: $name})
        MATCH (c)-[:PART_OF]->(w:RPGWorld {world_id: $worldId})
        RETURN c {
          .*,
          world_id: w.world_id
        } as campaign
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { name, worldId });
        return result.records.length > 0 ? result.records[0].get('campaign') : null;
      });

      return result;
    } catch (error) {
      console.error('Error finding Campaign by name:', error);
      throw error;
    }
  }

  /**
   * Check if a user is a participant in a campaign
   * @param campaignId Campaign ID
   * @param userId User ID
   * @returns True if user is a participant
   */
  async isParticipant(campaignId: string, userId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (u:User {user_id: $userId})
        RETURN (
          EXISTS((c)<-[:CREATED]-(u)) OR
          EXISTS((c)<-[:PARTICIPATES_IN]-(u))
        ) as isParticipant
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId, userId });
        return result.records.length > 0 ? result.records[0].get('isParticipant') : false;
      });

      return result;
    } catch (error) {
      console.error('Error checking if user is participant:', error);
      throw error;
    }
  }

  /**
   * Get participants of a campaign
   * @param campaignId Campaign ID
   * @returns Array of users
   */
  async getParticipants(campaignId: string): Promise<any[]> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (u:User)-[:PARTICIPATES_IN]->(c)
        RETURN u {.*} as user
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.map(record => record.get('user'));
      });

      return result;
    } catch (error) {
      console.error('Error getting campaign participants:', error);
      throw error;
    }
  }

  /**
   * Add participant to campaign
   * @param campaignId Campaign ID
   * @param userId User ID
   * @returns True if added
   */
  async addParticipant(campaignId: string, userId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (u:User {user_id: $userId})
        MERGE (u)-[:PARTICIPATES_IN]->(c)
        RETURN true as success
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId, userId });
        return result.records.length > 0 ? result.records[0].get('success') : false;
      });

      return result;
    } catch (error) {
      console.error('Error adding participant to campaign:', error);
      throw error;
    }
  }

  /**
   * Remove participant from campaign
   * @param campaignId Campaign ID
   * @param userId User ID
   * @returns True if removed
   */
  async removeParticipant(campaignId: string, userId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (u:User {user_id: $userId})-[r:PARTICIPATES_IN]->(c:Campaign {campaign_id: $campaignId})
        DELETE r
        RETURN true as success
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId, userId });
        return result.records.length > 0 ? result.records[0].get('success') : false;
      });

      return result;
    } catch (error) {
      console.error('Error removing participant from campaign:', error);
      throw error;
    }
  }

  /**
   * Check if a user is the owner of a campaign
   * @param campaignId Campaign ID
   * @param userId User ID
   * @returns True if user is the owner
   */
  async isOwner(campaignId: string, userId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (u:User {user_id: $userId})
        RETURN EXISTS((c)<-[:CREATED]-(u)) as isOwner
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId, userId });
        return result.records.length > 0 ? result.records[0].get('isOwner') : false;
      });

      return result;
    } catch (error) {
      console.error('Error checking if user is owner:', error);
      throw error;
    }
  }

  /**
   * Get users associated with a campaign
   * @param campaignId Campaign ID
   * @returns Array of users with their relationship types
   */
  async getUsers(campaignId: string): Promise<any[]> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (u:User)-[r:PARTICIPATES_IN|CREATED]->(c)
        RETURN u {
          .*,
          relationship_type: CASE
            WHEN type(r) = 'CREATED' THEN 'OWNER'
            ELSE r.relationship_type
          END
        } as user
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.map(record => record.get('user'));
      });

      return result;
    } catch (error) {
      console.error('Error getting campaign users:', error);
      throw error;
    }
  }

  /**
   * Add user to campaign with a specific relationship type
   * @param params Object containing campaign_id, user_id, and relationship_type
   * @returns The created relationship
   */
  async addUser(params: { campaign_id: string; user_id: string; relationship_type: string }): Promise<any> {
    try {
      const { campaign_id, user_id, relationship_type } = params;

      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (u:User {user_id: $userId})
        MERGE (u)-[r:PARTICIPATES_IN]->(c)
        SET r.relationship_type = $relationshipType
        RETURN u {
          .*,
          relationship_type: r.relationship_type
        } as user
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId: campaign_id,
          userId: user_id,
          relationshipType: relationship_type
        });
        return result.records.length > 0 ? result.records[0].get('user') : null;
      });

      return result;
    } catch (error) {
      console.error('Error adding user to campaign:', error);
      throw error;
    }
  }

  /**
   * Remove user from campaign
   * @param campaignId Campaign ID
   * @param userId User ID
   * @returns True if removed
   */
  async removeUser(campaignId: string, userId: string): Promise<boolean> {
    try {
      // Check if this is the only owner
      const isOnlyOwner = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(`
          MATCH (c:Campaign {campaign_id: $campaignId})
          MATCH (u:User {user_id: $userId})
          MATCH (c)<-[r:CREATED]-(u)
          WITH c, count(r) as ownerCount
          RETURN ownerCount = 1 as isOnlyOwner
        `, { campaignId, userId });

        return result.records.length > 0 ? result.records[0].get('isOnlyOwner') : false;
      });

      if (isOnlyOwner) {
        throw new Error('Cannot remove the only owner of a campaign');
      }

      // Remove the relationship
      const query = `
        MATCH (u:User {user_id: $userId})-[r:PARTICIPATES_IN|CREATED]->(c:Campaign {campaign_id: $campaignId})
        DELETE r
        RETURN true as success
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId, userId });
        return result.records.length > 0 ? result.records[0].get('success') : false;
      });

      return result;
    } catch (error) {
      console.error('Error removing user from campaign:', error);
      throw error;
    }
  }

  /**
   * Get sessions associated with a campaign
   * @param campaignId Campaign ID
   * @returns Array of sessions
   */
  async getSessions(campaignId: string): Promise<any[]> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (s:Session)-[:PART_OF]->(c)
        RETURN s {.*} as session
        ORDER BY s.session_date DESC
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.map(record => record.get('session'));
      });

      return result;
    } catch (error) {
      console.error('Error getting campaign sessions:', error);
      throw error;
    }
  }

  /**
   * Get characters associated with a campaign
   * @param campaignId Campaign ID
   * @returns Array of characters
   */
  async getCharacters(campaignId: string): Promise<any[]> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (ch:Character)-[:APPEARS_IN]->(c)
        OPTIONAL MATCH (u:User)-[:PLAYS]->(ch)
        RETURN ch {
          .*,
          player_id: u.user_id,
          player_name: u.username
        } as character
        ORDER BY ch.name
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.map(record => record.get('character'));
      });

      return result;
    } catch (error) {
      console.error('Error getting campaign characters:', error);
      throw error;
    }
  }

  /**
   * Get locations associated with a campaign
   * @param campaignId Campaign ID
   * @returns Array of locations
   */
  async getLocations(campaignId: string): Promise<any[]> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        MATCH (l:Location)-[:LOCATED_IN]->(c)
        OPTIONAL MATCH (l)-[:CHILD_OF]->(parent:Location)
        RETURN l {
          .*,
          parent_id: parent.location_id,
          parent_name: parent.name
        } as location
        ORDER BY l.name
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.map(record => record.get('location'));
      });

      return result;
    } catch (error) {
      console.error('Error getting campaign locations:', error);
      throw error;
    }
  }

  /**
   * Get statistics for a campaign
   * @param campaignId Campaign ID
   * @returns Campaign statistics
   */
  async getStatistics(campaignId: string): Promise<any> {
    try {
      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})

        // Count sessions
        OPTIONAL MATCH (s:Session)-[:PART_OF]->(c)
        WITH c, count(s) as sessionCount

        // Count characters
        OPTIONAL MATCH (ch:Character)-[:APPEARS_IN]->(c)
        WITH c, sessionCount, count(ch) as characterCount

        // Count locations
        OPTIONAL MATCH (l:Location)-[:LOCATED_IN]->(c)
        WITH c, sessionCount, characterCount, count(l) as locationCount

        // Count items
        OPTIONAL MATCH (i:Item)-[:BELONGS_TO]->(c)
        WITH c, sessionCount, characterCount, locationCount, count(i) as itemCount

        // Count events
        OPTIONAL MATCH (e:Event)-[:OCCURS_IN]->(c)
        WITH c, sessionCount, characterCount, locationCount, itemCount, count(e) as eventCount

        // Count users
        OPTIONAL MATCH (u:User)-[:PARTICIPATES_IN|CREATED]->(c)

        RETURN {
          campaign_id: c.campaign_id,
          name: c.name,
          session_count: sessionCount,
          character_count: characterCount,
          location_count: locationCount,
          item_count: itemCount,
          event_count: eventCount,
          user_count: count(u)
        } as statistics
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { campaignId });
        return result.records.length > 0 ? result.records[0].get('statistics') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting campaign statistics:', error);
      throw error;
    }
  }
}
