/**
 * Campaign user relationship types
 */
export enum CampaignUserRelationshipType {
  OWNER = 'OWNER',
  GAME_MASTER = 'GAME_MASTER',
  PLAYER = 'PLAYER',
  VIEWER = 'VIEWER'
}

/**
 * Campaign model
 */
export interface Campaign {
  /**
   * Unique identifier for the Campaign
   */
  campaign_id: string;

  /**
   * Name of the Campaign
   */
  name: string;

  /**
   * Description of the Campaign
   */
  description?: string;

  /**
   * ID of the RPG World this Campaign belongs to
   */
  world_id?: string;

  /**
   * Status of the Campaign (active, completed, on-hold, etc.)
   */
  status?: string;

  /**
   * Whether the campaign is active
   */
  is_active?: boolean;

  /**
   * Start date of the Campaign (timestamp)
   */
  start_date?: number;

  /**
   * End date of the Campaign (timestamp)
   */
  end_date?: number;

  /**
   * Tags for the Campaign
   */
  tags?: string[];

  /**
   * Creation timestamp
   */
  created_at?: number;

  /**
   * Last update timestamp
   */
  updated_at?: number;

  /**
   * ID of the user who created the Campaign
   */
  created_by?: string;

  /**
   * Image URL for the Campaign
   */
  image_url?: string;
}
