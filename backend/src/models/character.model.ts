/**
 * Character model
 */

/**
 * Character interface
 */
export interface Character {
  character_id: string;
  campaign_id: string;
  name: string;
  description?: string;
  character_type?: string;
  is_player_character: boolean;
  player_id?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Character creation parameters
 */
export interface CharacterCreationParams {
  campaign_id: string;
  name: string;
  description?: string;
  character_type?: string;
  is_player_character?: boolean;
  player_id?: string;
}

/**
 * Character update parameters
 */
export interface CharacterUpdateParams {
  name?: string;
  description?: string;
  character_type?: string;
  is_player_character?: boolean;
  player_id?: string;
}

/**
 * Character relationship
 */
export interface CharacterRelationship {
  relationship_id: string;
  source_character_id: string;
  target_character_id: string;
  relationship_type: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Character relationship creation parameters
 */
export interface CharacterRelationshipCreationParams {
  source_character_id: string;
  target_character_id: string;
  relationship_type: string;
  description?: string;
}

/**
 * Character relationship update parameters
 */
export interface CharacterRelationshipUpdateParams {
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
