import { BaseRepository } from './base.repository';
import { Session } from '../models/session.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for Session entities
 */
export class SessionRepository extends BaseRepository {
  /**
   * Create a new Session
   * @param session Session to create
   * @returns Created Session
   */
  async create(session: Omit<Session, 'session_id'>): Promise<Session> {
    try {
      // Generate ID if not provided
      const sessionId = uuidv4();

      const newSession: Session = {
        ...session,
        session_id: sessionId
      };

      const query = `
        CREATE (s:Session $session)
        RETURN s {.*} as session
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { session: newSession });
        return result.records[0].get('session');
      });

      // Create relationship to Campaign if campaignId is provided
      if (session.campaign_id) {
        await this.createCampaignRelationship(sessionId, session.campaign_id);
      }

      return result;
    } catch (error) {
      console.error('Error creating Session:', error);
      throw error;
    }
  }

  /**
   * Create relationship between Session and Campaign
   * @param sessionId Session ID
   * @param campaignId Campaign ID
   */
  async createCampaignRelationship(sessionId: string, campaignId: string): Promise<void> {
    try {
      const query = `
        MATCH (s:Session {session_id: $sessionId})
        MATCH (c:Campaign {campaign_id: $campaignId})
        MERGE (s)-[:PART_OF]->(c)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { sessionId, campaignId });
      });
    } catch (error) {
      console.error('Error creating Session-Campaign relationship:', error);
      throw error;
    }
  }

  /**
   * Get Session by ID
   * @param sessionId Session ID
   * @returns Session
   */
  async getById(sessionId: string): Promise<Session | null> {
    return this.findById(sessionId);
  }

  /**
   * Find Session by ID
   * @param sessionId Session ID
   * @returns Session
   */
  async findById(sessionId: string): Promise<Session | null> {
    try {
      const query = `
        MATCH (s:Session {session_id: $sessionId})
        OPTIONAL MATCH (s)-[:PART_OF]->(c:Campaign)
        RETURN s {
          .*,
          campaign_id: c.campaign_id
        } as session
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records.length > 0 ? result.records[0].get('session') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting Session by ID:', error);
      throw error;
    }
  }

  /**
   * Get all Sessions
   * @param campaignId Optional campaign ID to filter by
   * @param userId Optional user ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param search Search term
   * @returns Sessions and total count
   */
  async getAll(
    campaignId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ sessions: Session[]; total: number }> {
    return this.findAll({
      campaignId,
      userId,
      page,
      limit,
      search
    });
  }

  /**
   * Find all Sessions
   * @param options Search options
   * @returns Sessions and total count
   */
  async findAll(options: {
    campaignId?: string;
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ sessions: Session[]; total: number }> {
    const {
      campaignId,
      userId,
      page = 1,
      limit = 10,
      search
    } = options;
    try {
      let query = `
        MATCH (s:Session)
      `;

      // Add campaign filter if provided
      if (campaignId) {
        query += `
          MATCH (s)-[:PART_OF]->(c:Campaign {campaign_id: $campaignId})
        `;
      }

      // Add user filter if provided
      if (userId) {
        query += `
          MATCH (u:User {user_id: $userId})
          MATCH (s)<-[:CREATED]-(u)
        `;
      }

      // Add search filter if provided
      if (search) {
        query += `
          WHERE s.name CONTAINS $search OR s.summary CONTAINS $search
        `;
      }

      // Count total sessions
      const countQuery = query + `
        RETURN COUNT(s) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          campaignId,
          userId,
          search
        });
        return result.records[0].get('total').toNumber();
      });

      // Get sessions with pagination
      query += `
        OPTIONAL MATCH (s)-[:PART_OF]->(c:Campaign)
        RETURN s {
          .*,
          campaign_id: c.campaign_id
        } as session
        ORDER BY s.session_date DESC
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const sessionsResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId,
          userId,
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('session'));
      });

      return {
        sessions: sessionsResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error getting all Sessions:', error);
      throw error;
    }
  }

  /**
   * Update Session
   * @param sessionId Session ID
   * @param session Session data to update
   * @returns Updated Session
   */
  async update(sessionId: string, session: Partial<Session>): Promise<Session> {
    try {
      // Handle campaign_id separately
      const { campaign_id, ...sessionData } = session;

      const query = `
        MATCH (s:Session {session_id: $sessionId})
        SET s += $session
        RETURN s {.*} as session
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          sessionId,
          session: sessionData
        });

        if (result.records.length === 0) {
          throw new Error(`Session with ID ${sessionId} not found`);
        }

        return result.records[0].get('session');
      });

      // Update campaign relationship if campaign_id is provided
      if (campaign_id !== undefined) {
        // Remove existing relationship
        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(`
            MATCH (s:Session {session_id: $sessionId})-[r:PART_OF]->(:Campaign)
            DELETE r
          `, { sessionId });
        });

        // Create new relationship if campaign_id is not null
        if (campaign_id) {
          await this.createCampaignRelationship(sessionId, campaign_id);
        }
      }

      // Get updated session with campaign_id
      return await this.getById(sessionId) as Session;
    } catch (error) {
      console.error('Error updating Session:', error);
      throw error;
    }
  }

  /**
   * Delete Session
   * @param sessionId Session ID
   * @returns True if deleted
   */
  async delete(sessionId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (s:Session {session_id: $sessionId})
        DETACH DELETE s
        RETURN count(s) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting Session:', error);
      throw error;
    }
  }
}
