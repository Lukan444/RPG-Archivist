/**
 * Event model
 */

/**
 * Event type enum
 */
export enum EventType {
  BATTLE = 'BATTLE',
  SOCIAL = 'SOCIAL',
  EXPLORATION = 'EXPLORATION',
  DISCOVERY = 'DISCOVERY',
  QUEST = 'QUEST',
  TRAVEL = 'TRAVEL',
  REST = 'REST',
  OTHER = 'OTHER'
}

/**
 * Event interface
 */
export interface Event {
  event_id: string;
  campaign_id: string;
  session_id?: string;
  name: string;
  description?: string;
  event_type: EventType;
  event_date?: string; // In-game date
  timeline_position: number; // For ordering events
  location_id?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Event creation parameters
 */
export interface EventCreationParams {
  campaign_id: string;
  session_id?: string;
  name: string;
  description?: string;
  event_type: EventType;
  event_date?: string;
  timeline_position?: number;
  location_id?: string;
}

/**
 * Event update parameters
 */
export interface EventUpdateParams {
  name?: string;
  description?: string;
  event_type?: EventType;
  event_date?: string;
  timeline_position?: number;
  session_id?: string;
  location_id?: string;
}

/**
 * Event character interface
 */
export interface EventCharacter {
  event_character_id: string;
  event_id: string;
  character_id: string;
  role?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Event character creation parameters
 */
export interface EventCharacterCreationParams {
  event_id: string;
  character_id: string;
  role?: string;
  notes?: string;
}

/**
 * Event character update parameters
 */
export interface EventCharacterUpdateParams {
  role?: string;
  notes?: string;
}

/**
 * Event item interface
 */
export interface EventItem {
  event_item_id: string;
  event_id: string;
  item_id: string;
  role?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Event item creation parameters
 */
export interface EventItemCreationParams {
  event_id: string;
  item_id: string;
  role?: string;
  notes?: string;
}

/**
 * Event item update parameters
 */
export interface EventItemUpdateParams {
  role?: string;
  notes?: string;
}

/**
 * Timeline interface
 */
export interface Timeline {
  campaign_id: string;
  events: Event[];
}

/**
 * Timeline event position update parameters
 */
export interface TimelinePositionUpdateParams {
  timeline_position: number;
}
