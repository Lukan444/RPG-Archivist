/**
 * RPG World model
 */
export interface RPGWorld {
  /**
   * Unique identifier for the RPG World
   */
  world_id: string;
  
  /**
   * Name of the RPG World
   */
  name: string;
  
  /**
   * Description of the RPG World
   */
  description?: string;
  
  /**
   * System or ruleset used in the RPG World
   */
  system?: string;
  
  /**
   * Genre of the RPG World
   */
  genre?: string;
  
  /**
   * Tags for the RPG World
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
   * ID of the user who created the RPG World
   */
  created_by?: string;
  
  /**
   * Image URL for the RPG World
   */
  image_url?: string;
}
