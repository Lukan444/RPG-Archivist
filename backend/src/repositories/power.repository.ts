import { BaseRepository } from './base.repository';
import { DatabaseService } from '../services/database.service';
import { Power, PowerCreationParams, PowerUpdateParams, CharacterPower, CharacterPowerCreationParams, CharacterPowerUpdateParams, PowerType } from '../models/power.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for managing powers
 */
export class PowerRepository extends BaseRepository {
  constructor(dbService: DatabaseService) {
    super(dbService);
  }

  /**
   * Find all powers
   * @param campaignId Campaign ID
   * @param page Page number
   * @param limit Number of items per page
   * @param sort Sort field
   * @param order Sort order
   * @param search Search term
   * @param powerType Power type
   * @returns Powers and total count
   */
  public async findAll(
    campaignId: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'name',
    order: 'asc' | 'desc' = 'asc',
    search?: string,
    powerType?: PowerType
  ): Promise<{ powers: Power[], total: number }> {
    try {
      const skip = (page - 1) * limit;

      let query = `
        MATCH (p:Power)-[:BELONGS_TO]->(c:Campaign {campaign_id: $campaignId})
      `;

      // Add power type filter if provided
      if (powerType) {
        query += `
          WHERE p.power_type = $powerType
        `;
      }

      // Add search filter if provided
      if (search) {
        query += powerType
          ? `AND (p.name CONTAINS $search OR p.description CONTAINS $search)`
          : `WHERE (p.name CONTAINS $search OR p.description CONTAINS $search)`;
      }

      // Count total powers
      const countQuery = query + `
        RETURN COUNT(p) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, {
          campaignId,
          search,
          powerType
        });
        return result.records[0].get('total').toNumber();
      });

      // Get powers with pagination and sorting
      query += `
        RETURN p {
          .*,
          power_id: p.power_id,
          campaign_id: c.campaign_id
        } as power
        ORDER BY p.${sort} ${order}
        SKIP $skip
        LIMIT $limit
      `;

      const powers = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          campaignId,
          search,
          powerType,
          skip,
          limit
        });

        return result.records.map(record => {
          const power = record.get('power');
          return {
            power_id: power.power_id,
            campaign_id: power.campaign_id,
            name: power.name,
            description: power.description,
            power_type: power.power_type as PowerType,
            effect: power.effect,
            requirements: power.requirements,
            created_at: power.created_at,
            updated_at: power.updated_at,
            created_by: power.created_by
          };
        });
      });

      return { powers, total: countResult };
    } catch (error) {
      console.error('Error finding powers:', error);
      throw error;
    }
  }

  /**
   * Find power by ID
   * @param powerId Power ID
   * @returns Power
   */
  public async findById(powerId: string): Promise<Power | null> {
    try {
      const query = `
        MATCH (p:Power {power_id: $powerId})-[:BELONGS_TO]->(c:Campaign)
        RETURN p {
          .*,
          power_id: p.power_id,
          campaign_id: c.campaign_id
        } as power
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { powerId });
        return result.records.length > 0 ? result.records[0].get('power') : null;
      });

      if (!result) {
        return null;
      }

      return {
        power_id: result.power_id,
        campaign_id: result.campaign_id,
        name: result.name,
        description: result.description,
        power_type: result.power_type as PowerType,
        effect: result.effect,
        requirements: result.requirements,
        created_at: result.created_at,
        updated_at: result.updated_at,
        created_by: result.created_by
      };
    } catch (error) {
      console.error('Error finding power by ID:', error);
      throw error;
    }
  }

  /**
   * Create power
   * @param params Power creation parameters
   * @param userId User ID
   * @returns Created power
   */
  public async create(params: PowerCreationParams, userId: string): Promise<Power> {
    try {
      const powerId = uuidv4();
      const now = new Date().toISOString();

      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        CREATE (p:Power {
          power_id: $powerId,
          name: $name,
          description: $description,
          power_type: $powerType,
          effect: $effect,
          requirements: $requirements,
          created_at: $createdAt,
          created_by: $userId
        })-[:BELONGS_TO]->(c)
        RETURN p {
          .*,
          power_id: p.power_id,
          campaign_id: c.campaign_id
        } as power
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          powerId,
          campaignId: params.campaign_id,
          name: params.name,
          description: params.description || null,
          powerType: params.power_type,
          effect: params.effect || null,
          requirements: params.requirements || null,
          createdAt: now,
          userId
        });

        return result.records[0].get('power');
      });

      return {
        power_id: result.power_id,
        campaign_id: result.campaign_id,
        name: result.name,
        description: result.description,
        power_type: result.power_type as PowerType,
        effect: result.effect,
        requirements: result.requirements,
        created_at: result.created_at,
        created_by: result.created_by
      };
    } catch (error) {
      console.error('Error creating power:', error);
      throw error;
    }
  }

  /**
   * Update power
   * @param powerId Power ID
   * @param params Power update parameters
   * @returns Updated power
   */
  public async update(powerId: string, params: PowerUpdateParams): Promise<Power> {
    try {
      const now = new Date().toISOString();

      // Build dynamic SET clause based on provided parameters
      let setClause = 'p.updated_at = $updatedAt';
      const parameters: Record<string, any> = { powerId, updatedAt: now };

      if (params.name !== undefined) {
        setClause += ', p.name = $name';
        parameters.name = params.name;
      }

      if (params.description !== undefined) {
        setClause += ', p.description = $description';
        parameters.description = params.description;
      }

      if (params.power_type !== undefined) {
        setClause += ', p.power_type = $powerType';
        parameters.powerType = params.power_type;
      }

      if (params.effect !== undefined) {
        setClause += ', p.effect = $effect';
        parameters.effect = params.effect;
      }

      if (params.requirements !== undefined) {
        setClause += ', p.requirements = $requirements';
        parameters.requirements = params.requirements;
      }

      const query = `
        MATCH (p:Power {power_id: $powerId})-[:BELONGS_TO]->(c:Campaign)
        SET ${setClause}
        RETURN p {
          .*,
          power_id: p.power_id,
          campaign_id: c.campaign_id
        } as power
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, parameters);

        if (result.records.length === 0) {
          throw new Error('Power not found');
        }

        return result.records[0].get('power');
      });

      return {
        power_id: result.power_id,
        campaign_id: result.campaign_id,
        name: result.name,
        description: result.description,
        power_type: result.power_type as PowerType,
        effect: result.effect,
        requirements: result.requirements,
        created_at: result.created_at,
        updated_at: result.updated_at,
        created_by: result.created_by
      };
    } catch (error) {
      console.error('Error updating power:', error);
      throw error;
    }
  }

  /**
   * Delete power
   * @param powerId Power ID
   * @returns True if deleted
   */
  public async delete(powerId: string): Promise<boolean> {
    try {
      // First check if power has any characters associated with it
      const checkQuery = `
        MATCH (c:Character)-[:HAS_POWER]->(:CharacterPower)-[:POWER_DETAILS]->(p:Power {power_id: $powerId})
        RETURN COUNT(c) as characterCount
      `;

      const characterCount = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(checkQuery, { powerId });
        return result.records[0].get('characterCount').toNumber();
      });

      if (characterCount > 0) {
        throw new Error('Cannot delete power with associated characters');
      }

      // If no characters are associated, delete the power
      const deleteQuery = `
        MATCH (p:Power {power_id: $powerId})
        DETACH DELETE p
        RETURN true as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(deleteQuery, { powerId });
        return result.records.length > 0 ? result.records[0].get('deleted') : false;
      });

      return result;
    } catch (error) {
      console.error('Error deleting power:', error);
      throw error;
    }
  }

  /**
   * Get characters with power
   * @param powerId Power ID
   * @returns Character powers
   */
  public async getCharactersWithPower(powerId: string): Promise<CharacterPower[]> {
    try {
      const query = `
        MATCH (c:Character)-[:HAS_POWER]->(cp:CharacterPower)-[:POWER_DETAILS]->(p:Power {power_id: $powerId})
        RETURN cp {
          .*,
          character_power_id: cp.character_power_id,
          character_id: c.character_id,
          power_id: p.power_id
        } as characterPower
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { powerId });

        return result.records.map(record => {
          const cp = record.get('characterPower');
          return {
            character_power_id: cp.character_power_id,
            character_id: cp.character_id,
            power_id: cp.power_id,
            proficiency_level: cp.proficiency_level,
            notes: cp.notes,
            created_at: cp.created_at,
            updated_at: cp.updated_at
          };
        });
      });

      return result;
    } catch (error) {
      console.error('Error getting characters with power:', error);
      throw error;
    }
  }

  /**
   * Get character power
   * @param characterId Character ID
   * @param powerId Power ID
   * @returns Character power
   */
  public async getCharacterPower(characterId: string, powerId: string): Promise<CharacterPower | null> {
    try {
      const query = `
        MATCH (c:Character {character_id: $characterId})-[:HAS_POWER]->(cp:CharacterPower)-[:POWER_DETAILS]->(p:Power {power_id: $powerId})
        RETURN cp {
          .*,
          character_power_id: cp.character_power_id,
          character_id: c.character_id,
          power_id: p.power_id
        } as characterPower
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { characterId, powerId });
        return result.records.length > 0 ? result.records[0].get('characterPower') : null;
      });

      if (!result) {
        return null;
      }

      return {
        character_power_id: result.character_power_id,
        character_id: result.character_id,
        power_id: result.power_id,
        proficiency_level: result.proficiency_level,
        notes: result.notes,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error getting character power:', error);
      throw error;
    }
  }

  /**
   * Add power to character
   * @param params Character power creation parameters
   * @returns Created character power
   */
  public async addPowerToCharacter(params: CharacterPowerCreationParams): Promise<CharacterPower> {
    try {
      const characterPowerId = uuidv4();
      const now = new Date().toISOString();

      const query = `
        MATCH (c:Character {character_id: $characterId})
        MATCH (p:Power {power_id: $powerId})
        CREATE (c)-[:HAS_POWER]->(cp:CharacterPower {
          character_power_id: $characterPowerId,
          proficiency_level: $proficiencyLevel,
          notes: $notes,
          created_at: $createdAt,
          updated_at: $createdAt
        })-[:POWER_DETAILS]->(p)
        RETURN cp {
          .*,
          character_power_id: cp.character_power_id,
          character_id: c.character_id,
          power_id: p.power_id
        } as characterPower
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          characterPowerId,
          characterId: params.character_id,
          powerId: params.power_id,
          proficiencyLevel: params.proficiency_level || null,
          notes: params.notes || null,
          createdAt: now
        });

        return result.records[0].get('characterPower');
      });

      return {
        character_power_id: result.character_power_id,
        character_id: result.character_id,
        power_id: result.power_id,
        proficiency_level: result.proficiency_level,
        notes: result.notes,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error adding power to character:', error);
      throw error;
    }
  }

  /**
   * Update character power
   * @param characterId Character ID
   * @param powerId Power ID
   * @param params Character power update parameters
   * @returns Updated character power
   */
  public async updateCharacterPower(characterId: string, powerId: string, params: CharacterPowerUpdateParams): Promise<CharacterPower> {
    try {
      const now = new Date().toISOString();

      // Build dynamic SET clause based on provided parameters
      let setClause = 'cp.updated_at = $updatedAt';
      const parameters: Record<string, any> = { characterId, powerId, updatedAt: now };

      if (params.proficiency_level !== undefined) {
        setClause += ', cp.proficiency_level = $proficiencyLevel';
        parameters.proficiencyLevel = params.proficiency_level;
      }

      if (params.notes !== undefined) {
        setClause += ', cp.notes = $notes';
        parameters.notes = params.notes;
      }

      const query = `
        MATCH (c:Character {character_id: $characterId})-[:HAS_POWER]->(cp:CharacterPower)-[:POWER_DETAILS]->(p:Power {power_id: $powerId})
        SET ${setClause}
        RETURN cp {
          .*,
          character_power_id: cp.character_power_id,
          character_id: c.character_id,
          power_id: p.power_id
        } as characterPower
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, parameters);

        if (result.records.length === 0) {
          throw new Error('Character power not found');
        }

        return result.records[0].get('characterPower');
      });

      return {
        character_power_id: result.character_power_id,
        character_id: result.character_id,
        power_id: result.power_id,
        proficiency_level: result.proficiency_level,
        notes: result.notes,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error updating character power:', error);
      throw error;
    }
  }

  /**
   * Remove power from character
   * @param characterId Character ID
   * @param powerId Power ID
   * @returns True if removed
   */
  public async removePowerFromCharacter(characterId: string, powerId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:Character {character_id: $characterId})-[:HAS_POWER]->(cp:CharacterPower)-[:POWER_DETAILS]->(p:Power {power_id: $powerId})
        DETACH DELETE cp
        RETURN true as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { characterId, powerId });
        return result.records.length > 0 ? result.records[0].get('deleted') : false;
      });

      return result;
    } catch (error) {
      console.error('Error removing power from character:', error);
      throw error;
    }
  }
}
