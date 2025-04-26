import { BaseRepository } from './base.repository';
import { Character, CharacterRelationship, CharacterRelationshipCreationParams, CharacterRelationshipUpdateParams } from '../models/character.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for Character entities
 */
export class CharacterRepository extends BaseRepository {
  /**
   * Create a new Character
   * @param character Character to create
   * @param createdBy User ID of the creator
   * @returns Created Character
   */
  async create(character: Omit<Character, 'character_id' | 'created_at' | 'created_by'>, createdBy?: string): Promise<Character> {
    try {
      // Generate ID if not provided
      const characterId = uuidv4();
      const now = new Date().toISOString();

      const newCharacter: Character = {
        ...character,
        character_id: characterId,
        created_at: now,
        created_by: createdBy || 'system',
        is_player_character: character.is_player_character !== undefined ? character.is_player_character : false
      };

      const query = `
        CREATE (c:Character $character)
        RETURN c {.*} as character
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { character: newCharacter });
        return result.records[0].get('character');
      });

      // Create relationship to Campaign if campaignId is provided
      if (character.campaign_id) {
        await this.createCampaignRelationship(characterId, character.campaign_id);
      }

      return result;
    } catch (error) {
      console.error('Error creating Character:', error);
      throw error;
    }
  }

  /**
   * Create relationship between Character and Campaign
   * @param characterId Character ID
   * @param campaignId Campaign ID
   */
  async createCampaignRelationship(characterId: string, campaignId: string): Promise<void> {
    try {
      const query = `
        MATCH (c:Character {character_id: $characterId})
        MATCH (camp:Campaign {campaign_id: $campaignId})
        MERGE (c)-[:BELONGS_TO]->(camp)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { characterId, campaignId });
      });
    } catch (error) {
      console.error('Error creating Character-Campaign relationship:', error);
      throw error;
    }
  }

  /**
   * Get Character by ID
   * @param characterId Character ID
   * @returns Character
   */
  async getById(characterId: string): Promise<Character | null> {
    try {
      const query = `
        MATCH (c:Character {character_id: $characterId})
        OPTIONAL MATCH (c)-[:BELONGS_TO]->(camp:Campaign)
        RETURN c {
          .*,
          campaign_id: camp.campaign_id
        } as character
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { characterId });
        return result.records.length > 0 ? result.records[0].get('character') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting Character by ID:', error);
      throw error;
    }
  }

  /**
   * Find Character by ID
   * @param characterId Character ID
   * @returns Character
   */
  async findById(characterId: string): Promise<Character | null> {
    return this.getById(characterId);
  }

  /**
   * Get all Characters
   * @param campaignId Optional campaign ID to filter by
   * @param userId Optional user ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param search Search term
   * @returns Characters and total count
   */
  async getAll(
    campaignId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ characters: Character[]; total: number }> {
    try {
      let query = `
        MATCH (c:Character)
      `;

      // Add campaign filter if provided
      if (campaignId) {
        query += `
          MATCH (c)-[:BELONGS_TO]->(camp:Campaign {campaign_id: $campaignId})
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

      // Count total characters
      const countQuery = query + `
        RETURN COUNT(c) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          campaignId,
          userId,
          search
        });
        return result.records[0].get('total').toNumber();
      });

      // Get characters with pagination
      query += `
        OPTIONAL MATCH (c)-[:BELONGS_TO]->(camp:Campaign)
        RETURN c {
          .*,
          campaign_id: camp.campaign_id
        } as character
        ORDER BY c.name
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const charactersResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId,
          userId,
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('character'));
      });

      return {
        characters: charactersResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error getting all Characters:', error);
      throw error;
    }
  }

  /**
   * Update Character
   * @param characterId Character ID
   * @param character Character data to update
   * @returns Updated Character
   */
  async update(characterId: string, character: Partial<Character>): Promise<Character> {
    try {
      // Handle campaign_id separately
      const { campaign_id, ...characterData } = character;

      const query = `
        MATCH (c:Character {character_id: $characterId})
        SET c += $character
        RETURN c {.*} as character
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          characterId,
          character: characterData
        });

        if (result.records.length === 0) {
          throw new Error(`Character with ID ${characterId} not found`);
        }

        return result.records[0].get('character');
      });

      // Update campaign relationship if campaign_id is provided
      if (campaign_id !== undefined) {
        // Remove existing relationship
        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(`
            MATCH (c:Character {character_id: $characterId})-[r:BELONGS_TO]->(:Campaign)
            DELETE r
          `, { characterId });
        });

        // Create new relationship if campaign_id is not null
        if (campaign_id) {
          await this.createCampaignRelationship(characterId, campaign_id);
        }
      }

      // Get updated character with campaign_id
      return await this.getById(characterId) as Character;
    } catch (error) {
      console.error('Error updating Character:', error);
      throw error;
    }
  }

  /**
   * Delete Character
   * @param characterId Character ID
   * @returns True if deleted
   */
  async delete(characterId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:Character {character_id: $characterId})
        DETACH DELETE c
        RETURN count(c) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { characterId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting Character:', error);
      throw error;
    }
  }

  /**
   * Find all Characters with filtering and pagination
   * @param campaignId Optional campaign ID to filter by
   * @param page Page number
   * @param limit Items per page
   * @param sort Sort field
   * @param order Sort order
   * @param search Search term
   * @param isPlayerCharacter Optional filter for player characters
   * @param characterType Optional filter for character type
   * @returns Characters and total count
   */
  async findAll(
    campaignId?: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'name',
    order: 'asc' | 'desc' = 'asc',
    search?: string,
    isPlayerCharacter?: boolean,
    characterType?: string
  ): Promise<{ characters: Character[]; total: number }> {
    try {
      let query = `
        MATCH (c:Character)
      `;

      // Add campaign filter if provided
      if (campaignId) {
        query += `
          MATCH (c)-[:BELONGS_TO]->(camp:Campaign {campaign_id: $campaignId})
        `;
      }

      // Build WHERE clause
      const whereConditions = [];

      // Add search filter if provided
      if (search) {
        whereConditions.push(`(c.name CONTAINS $search OR c.description CONTAINS $search)`);
      }

      // Add player character filter if provided
      if (isPlayerCharacter !== undefined) {
        whereConditions.push(`c.is_player_character = $isPlayerCharacter`);
      }

      // Add character type filter if provided
      if (characterType) {
        whereConditions.push(`c.character_type = $characterType`);
      }

      // Add WHERE clause if there are conditions
      if (whereConditions.length > 0) {
        query += `
          WHERE ${whereConditions.join(' AND ')}
        `;
      }

      // Count total characters
      const countQuery = query + `
        RETURN COUNT(c) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          campaignId,
          search,
          isPlayerCharacter,
          characterType
        });
        return result.records[0].get('total').toNumber();
      });

      // Get characters with pagination
      query += `
        OPTIONAL MATCH (c)-[:BELONGS_TO]->(camp:Campaign)
        RETURN c {
          .*,
          campaign_id: camp.campaign_id
        } as character
        ORDER BY c.${sort} ${order}
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const charactersResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId,
          search,
          isPlayerCharacter,
          characterType,
          skip,
          limit
        });
        return result.records.map(record => record.get('character'));
      });

      return {
        characters: charactersResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error finding all Characters:', error);
      throw error;
    }
  }

  /**
   * Get character relationships
   * @param characterId Character ID
   * @returns Character relationships
   */
  async getRelationships(characterId: string): Promise<CharacterRelationship[]> {
    try {
      const query = `
        MATCH (c:Character {character_id: $characterId})-[r:RELATES_TO]->(target:Character)
        RETURN {
          relationship_id: r.relationship_id,
          source_character_id: c.character_id,
          target_character_id: target.character_id,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { characterId });
        return result.records.map(record => record.get('relationship'));
      });

      return result;
    } catch (error) {
      console.error('Error getting Character relationships:', error);
      throw error;
    }
  }

  /**
   * Get character relationship by ID
   * @param relationshipId Relationship ID
   * @returns Character relationship
   */
  async getRelationshipById(relationshipId: string): Promise<CharacterRelationship | null> {
    try {
      const query = `
        MATCH (source:Character)-[r:RELATES_TO {relationship_id: $relationshipId}]->(target:Character)
        RETURN {
          relationship_id: r.relationship_id,
          source_character_id: source.character_id,
          target_character_id: target.character_id,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { relationshipId });
        return result.records.length > 0 ? result.records[0].get('relationship') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting Character relationship by ID:', error);
      throw error;
    }
  }

  /**
   * Create character relationship
   * @param params Relationship creation parameters
   * @returns Created relationship
   */
  async createRelationship(params: CharacterRelationshipCreationParams): Promise<CharacterRelationship> {
    try {
      const relationshipId = uuidv4();
      const now = new Date().toISOString();

      const relationship: CharacterRelationship = {
        relationship_id: relationshipId,
        source_character_id: params.source_character_id,
        target_character_id: params.target_character_id,
        relationship_type: params.relationship_type,
        description: params.description,
        created_at: now,
        updated_at: now
      };

      const query = `
        MATCH (source:Character {character_id: $sourceCharacterId})
        MATCH (target:Character {character_id: $targetCharacterId})
        CREATE (source)-[r:RELATES_TO $relationship]->(target)
        RETURN {
          relationship_id: r.relationship_id,
          source_character_id: source.character_id,
          target_character_id: target.character_id,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          sourceCharacterId: params.source_character_id,
          targetCharacterId: params.target_character_id,
          relationship
        });
        return result.records[0].get('relationship');
      });

      return result;
    } catch (error) {
      console.error('Error creating Character relationship:', error);
      throw error;
    }
  }

  /**
   * Update character relationship
   * @param relationshipId Relationship ID
   * @param params Relationship update parameters
   * @returns Updated relationship
   */
  async updateRelationship(relationshipId: string, params: CharacterRelationshipUpdateParams): Promise<CharacterRelationship> {
    try {
      const now = new Date().toISOString();

      const query = `
        MATCH (source:Character)-[r:RELATES_TO {relationship_id: $relationshipId}]->(target:Character)
        SET r += $params
        SET r.updated_at = $now
        RETURN {
          relationship_id: r.relationship_id,
          source_character_id: source.character_id,
          target_character_id: target.character_id,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          relationshipId,
          params,
          now
        });

        if (result.records.length === 0) {
          throw new Error(`Relationship with ID ${relationshipId} not found`);
        }

        return result.records[0].get('relationship');
      });

      return result;
    } catch (error) {
      console.error('Error updating Character relationship:', error);
      throw error;
    }
  }

  /**
   * Delete character relationship
   * @param relationshipId Relationship ID
   * @returns True if deleted
   */
  async deleteRelationship(relationshipId: string): Promise<boolean> {
    try {
      const query = `
        MATCH ()-[r:RELATES_TO {relationship_id: $relationshipId}]->()
        DELETE r
        RETURN count(r) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { relationshipId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting Character relationship:', error);
      throw error;
    }
  }
}
