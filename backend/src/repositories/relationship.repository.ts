import { BaseRepository } from './base.repository';
import { Relationship, EntityType } from '../models/relationship.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for Relationship entities
 */
export class RelationshipRepository extends BaseRepository {
  /**
   * Find relationship by ID
   * @param relationshipId Relationship ID
   * @returns Relationship or null if not found
   */
  async findById(relationshipId: string): Promise<Relationship | null> {
    try {
      const query = `
        MATCH (r:Relationship {relationship_id: $relationshipId})
        MATCH (r)-[:BELONGS_TO]->(c:Campaign)
        OPTIONAL MATCH (r)-[:RELATES]->(source)
        OPTIONAL MATCH (r)-[:RELATES_TO]->(target)
        RETURN {
          relationship_id: r.relationship_id,
          campaign_id: c.campaign_id,
          source_entity_id: source.entity_id,
          source_entity_type: r.source_entity_type,
          target_entity_id: target.entity_id,
          target_entity_type: r.target_entity_type,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          created_by: r.created_by,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { relationshipId });
        return result.records.length > 0 ? result.records[0].get('relationship') : null;
      });

      return result;
    } catch (error) {
      console.error('Error finding relationship by ID:', error);
      throw error;
    }
  }

  /**
   * Find all relationships
   * @param campaignId Campaign ID
   * @param page Page number
   * @param limit Items per page
   * @param sortBy Sort field
   * @param sortOrder Sort order
   * @param filters Filters
   * @returns Relationships and total count
   */
  async findAll(
    campaignId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters: {
      source_entity_id?: string;
      source_entity_type?: EntityType;
      target_entity_id?: string;
      target_entity_type?: EntityType;
      relationship_type?: string;
      entity_id?: string;
      entity_type?: EntityType;
    } = {}
  ): Promise<{ relationships: Relationship[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build filter conditions
      let filterConditions = '';
      const params: Record<string, any> = { campaignId, skip, limit };
      
      if (filters.source_entity_id) {
        filterConditions += ' AND source.entity_id = $sourceEntityId';
        params.sourceEntityId = filters.source_entity_id;
      }
      
      if (filters.source_entity_type) {
        filterConditions += ' AND r.source_entity_type = $sourceEntityType';
        params.sourceEntityType = filters.source_entity_type;
      }
      
      if (filters.target_entity_id) {
        filterConditions += ' AND target.entity_id = $targetEntityId';
        params.targetEntityId = filters.target_entity_id;
      }
      
      if (filters.target_entity_type) {
        filterConditions += ' AND r.target_entity_type = $targetEntityType';
        params.targetEntityType = filters.target_entity_type;
      }
      
      if (filters.relationship_type) {
        filterConditions += ' AND r.relationship_type = $relationshipType';
        params.relationshipType = filters.relationship_type;
      }
      
      if (filters.entity_id) {
        filterConditions += ' AND (source.entity_id = $entityId OR target.entity_id = $entityId)';
        params.entityId = filters.entity_id;
      }
      
      if (filters.entity_type) {
        filterConditions += ' AND (r.source_entity_type = $entityType OR r.target_entity_type = $entityType)';
        params.entityType = filters.entity_type;
      }

      // Query for relationships
      const query = `
        MATCH (r:Relationship)-[:BELONGS_TO]->(c:Campaign {campaign_id: $campaignId})
        OPTIONAL MATCH (r)-[:RELATES]->(source)
        OPTIONAL MATCH (r)-[:RELATES_TO]->(target)
        WHERE 1=1 ${filterConditions}
        RETURN {
          relationship_id: r.relationship_id,
          campaign_id: c.campaign_id,
          source_entity_id: source.entity_id,
          source_entity_type: r.source_entity_type,
          target_entity_id: target.entity_id,
          target_entity_type: r.target_entity_type,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          created_by: r.created_by,
          updated_at: r.updated_at
        } as relationship
        ORDER BY r.${sortBy} ${sortOrder}
        SKIP $skip
        LIMIT $limit
      `;

      // Query for total count
      const countQuery = `
        MATCH (r:Relationship)-[:BELONGS_TO]->(c:Campaign {campaign_id: $campaignId})
        OPTIONAL MATCH (r)-[:RELATES]->(source)
        OPTIONAL MATCH (r)-[:RELATES_TO]->(target)
        WHERE 1=1 ${filterConditions}
        RETURN count(r) as total
      `;

      const [relationships, totalResult] = await Promise.all([
        this.dbService.readTransaction(async (tx) => {
          const result = await tx.run(query, params);
          return result.records.map(record => record.get('relationship'));
        }),
        this.dbService.readTransaction(async (tx) => {
          const result = await tx.run(countQuery, params);
          return result.records[0].get('total').toNumber();
        })
      ]);

      return { relationships, total: totalResult };
    } catch (error) {
      console.error('Error finding relationships:', error);
      throw error;
    }
  }

  /**
   * Create relationship
   * @param relationship Relationship to create
   * @param userId User ID
   * @returns Created relationship
   */
  async create(relationship: Omit<Relationship, 'relationship_id' | 'created_at' | 'updated_at'>, userId: string): Promise<Relationship> {
    try {
      const relationshipId = uuidv4();
      const now = new Date().toISOString();

      const newRelationship = {
        ...relationship,
        relationship_id: relationshipId,
        created_at: now,
        created_by: userId,
        updated_at: now
      };

      const query = `
        MATCH (c:Campaign {campaign_id: $campaignId})
        
        // Match source entity based on type
        CALL {
          WITH $sourceEntityId, $sourceEntityType
          MATCH (source)
          WHERE 
            (
              $sourceEntityType = 'CHARACTER' AND source:Character AND source.character_id = $sourceEntityId
            ) OR (
              $sourceEntityType = 'LOCATION' AND source:Location AND source.location_id = $sourceEntityId
            ) OR (
              $sourceEntityType = 'EVENT' AND source:Event AND source.event_id = $sourceEntityId
            ) OR (
              $sourceEntityType = 'ITEM' AND source:Item AND source.item_id = $sourceEntityId
            )
          RETURN source
        }
        
        // Match target entity based on type
        CALL {
          WITH $targetEntityId, $targetEntityType
          MATCH (target)
          WHERE 
            (
              $targetEntityType = 'CHARACTER' AND target:Character AND target.character_id = $targetEntityId
            ) OR (
              $targetEntityType = 'LOCATION' AND target:Location AND target.location_id = $targetEntityId
            ) OR (
              $targetEntityType = 'EVENT' AND target:Event AND target.event_id = $targetEntityId
            ) OR (
              $targetEntityType = 'ITEM' AND target:Item AND target.item_id = $targetEntityId
            )
          RETURN target
        }
        
        // Create relationship node and connect it
        CREATE (r:Relationship {
          relationship_id: $relationshipId,
          source_entity_type: $sourceEntityType,
          target_entity_type: $targetEntityType,
          relationship_type: $relationshipType,
          description: $description,
          created_at: $createdAt,
          created_by: $createdBy,
          updated_at: $updatedAt
        })
        CREATE (r)-[:BELONGS_TO]->(c)
        CREATE (r)-[:RELATES]->(source)
        CREATE (r)-[:RELATES_TO]->(target)
        
        RETURN {
          relationship_id: r.relationship_id,
          campaign_id: c.campaign_id,
          source_entity_id: $sourceEntityId,
          source_entity_type: r.source_entity_type,
          target_entity_id: $targetEntityId,
          target_entity_type: r.target_entity_type,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          created_by: r.created_by,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          relationshipId: newRelationship.relationship_id,
          campaignId: newRelationship.campaign_id,
          sourceEntityId: newRelationship.source_entity_id,
          sourceEntityType: newRelationship.source_entity_type,
          targetEntityId: newRelationship.target_entity_id,
          targetEntityType: newRelationship.target_entity_type,
          relationshipType: newRelationship.relationship_type,
          description: newRelationship.description,
          createdAt: newRelationship.created_at,
          createdBy: newRelationship.created_by,
          updatedAt: newRelationship.updated_at
        });
        return result.records[0].get('relationship');
      });

      return result;
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  }

  /**
   * Update relationship
   * @param relationshipId Relationship ID
   * @param updates Updates to apply
   * @returns Updated relationship
   */
  async update(relationshipId: string, updates: Partial<Pick<Relationship, 'relationship_type' | 'description'>>): Promise<Relationship> {
    try {
      const now = new Date().toISOString();

      const query = `
        MATCH (r:Relationship {relationship_id: $relationshipId})
        MATCH (r)-[:BELONGS_TO]->(c:Campaign)
        OPTIONAL MATCH (r)-[:RELATES]->(source)
        OPTIONAL MATCH (r)-[:RELATES_TO]->(target)
        
        SET r.relationship_type = $relationshipType
        SET r.description = $description
        SET r.updated_at = $updatedAt
        
        RETURN {
          relationship_id: r.relationship_id,
          campaign_id: c.campaign_id,
          source_entity_id: source.entity_id,
          source_entity_type: r.source_entity_type,
          target_entity_id: target.entity_id,
          target_entity_type: r.target_entity_type,
          relationship_type: r.relationship_type,
          description: r.description,
          created_at: r.created_at,
          created_by: r.created_by,
          updated_at: r.updated_at
        } as relationship
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          relationshipId,
          relationshipType: updates.relationship_type,
          description: updates.description,
          updatedAt: now
        });
        return result.records[0].get('relationship');
      });

      return result;
    } catch (error) {
      console.error('Error updating relationship:', error);
      throw error;
    }
  }

  /**
   * Delete relationship
   * @param relationshipId Relationship ID
   * @returns True if deleted
   */
  async delete(relationshipId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (r:Relationship {relationship_id: $relationshipId})
        DETACH DELETE r
        RETURN count(r) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { relationshipId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
  }
}
