/**
 * Power/Skill model
 */

/**
 * Power type enum
 */
export enum PowerType {
  SKILL = 'SKILL',
  ABILITY = 'ABILITY',
  SPELL = 'SPELL',
  FEAT = 'FEAT',
  TRAIT = 'TRAIT',
  OTHER = 'OTHER'
}

/**
 * Power interface
 */
export interface Power {
  power_id: string;
  campaign_id: string;
  name: string;
  description?: string;
  power_type: PowerType;
  effect?: string;
  requirements?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Power creation parameters
 */
export interface PowerCreationParams {
  campaign_id: string;
  name: string;
  description?: string;
  power_type: PowerType;
  effect?: string;
  requirements?: string;
}

/**
 * Power update parameters
 */
export interface PowerUpdateParams {
  name?: string;
  description?: string;
  power_type?: PowerType;
  effect?: string;
  requirements?: string;
}

/**
 * Character power interface
 */
export interface CharacterPower {
  character_power_id: string;
  character_id: string;
  power_id: string;
  proficiency_level?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Character power creation parameters
 */
export interface CharacterPowerCreationParams {
  character_id: string;
  power_id: string;
  proficiency_level?: number;
  notes?: string;
}

/**
 * Character power update parameters
 */
export interface CharacterPowerUpdateParams {
  proficiency_level?: number;
  notes?: string;
}
