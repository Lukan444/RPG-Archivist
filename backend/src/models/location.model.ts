/**
 * Location model
 */

/**
 * Location interface
 */
export interface Location {
  location_id: string;
  campaign_id: string;
  name: string;
  description?: string;
  location_type?: string;
  parent_location_id?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Location creation parameters
 */
export interface LocationCreationParams {
  campaign_id: string;
  name: string;
  description?: string;
  location_type?: string;
  parent_location_id?: string;
}

/**
 * Location update parameters
 */
export interface LocationUpdateParams {
  name?: string;
  description?: string;
  location_type?: string;
  parent_location_id?: string;
}

/**
 * Location relationship
 */
export interface LocationRelationship {
  relationship_id: string;
  source_location_id: string;
  target_location_id: string;
  relationship_type: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Location relationship creation parameters
 */
export interface LocationRelationshipCreationParams {
  source_location_id: string;
  target_location_id: string;
  relationship_type: string;
  description?: string;
}

/**
 * Location relationship update parameters
 */
export interface LocationRelationshipUpdateParams {
  relationship_type?: string;
  description?: string;
}

/**
 * Character location relationship
 */
export interface CharacterLocationRelationship {
  relationship_id: string;
  character_id: string;
  location_id: string;
  relationship_type: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Character location relationship creation parameters
 */
export interface CharacterLocationRelationshipCreationParams {
  character_id: string;
  location_id: string;
  relationship_type: string;
  description?: string;
}

/**
 * Character location relationship update parameters
 */
export interface CharacterLocationRelationshipUpdateParams {
  relationship_type?: string;
  description?: string;
}
