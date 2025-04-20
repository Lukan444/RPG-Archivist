/**
 * Session model
 */

/**
 * Session interface
 */
export interface Session {
  session_id: string;
  campaign_id: string;
  name: string;
  description?: string;
  number: number;
  date?: string;
  duration_minutes?: number;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Session creation parameters
 */
export interface SessionCreationParams {
  campaign_id: string;
  name: string;
  description?: string;
  number?: number;
  date?: string;
  duration_minutes?: number;
  is_completed?: boolean;
}

/**
 * Session update parameters
 */
export interface SessionUpdateParams {
  name?: string;
  description?: string;
  number?: number;
  date?: string;
  duration_minutes?: number;
  is_completed?: boolean;
}

/**
 * Transcription interface
 */
export interface Transcription {
  transcription_id: string;
  session_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Transcription creation parameters
 */
export interface TranscriptionCreationParams {
  session_id: string;
  content: string;
}

/**
 * Transcription update parameters
 */
export interface TranscriptionUpdateParams {
  content: string;
}

/**
 * Session character relationship
 */
export interface SessionCharacterRelationship {
  relationship_id: string;
  session_id: string;
  character_id: string;
  created_at: string;
}

/**
 * Session character relationship creation parameters
 */
export interface SessionCharacterRelationshipCreationParams {
  session_id: string;
  character_id: string;
}

/**
 * Session event relationship
 */
export interface SessionEventRelationship {
  relationship_id: string;
  session_id: string;
  event_id: string;
  created_at: string;
}

/**
 * Session event relationship creation parameters
 */
export interface SessionEventRelationshipCreationParams {
  session_id: string;
  event_id: string;
}
