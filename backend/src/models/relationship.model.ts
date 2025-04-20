/**
 * Relationship model
 */

/**
 * Entity type enum
 */
export enum EntityType {
  CHARACTER = 'CHARACTER',
  LOCATION = 'LOCATION',
  EVENT = 'EVENT',
  ITEM = 'ITEM'
}

/**
 * Relationship interface
 */
export interface Relationship {
  relationship_id: string;
  campaign_id: string;
  source_entity_id: string;
  source_entity_type: EntityType;
  target_entity_id: string;
  target_entity_type: EntityType;
  relationship_type: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Relationship creation parameters
 */
export interface RelationshipCreationParams {
  campaign_id: string;
  source_entity_id: string;
  source_entity_type: EntityType;
  target_entity_id: string;
  target_entity_type: EntityType;
  relationship_type: string;
  description?: string;
}

/**
 * Relationship update parameters
 */
export interface RelationshipUpdateParams {
  relationship_type?: string;
  description?: string;
}

/**
 * Relationship query parameters
 */
export interface RelationshipQueryParams {
  campaign_id?: string;
  source_entity_id?: string;
  source_entity_type?: EntityType;
  target_entity_id?: string;
  target_entity_type?: EntityType;
  relationship_type?: string;
  entity_id?: string;
  entity_type?: EntityType;
}
