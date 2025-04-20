/**
 * Item model
 */

/**
 * Item type enum
 */
export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  WAND = 'WAND',
  RING = 'RING',
  AMULET = 'AMULET',
  TOOL = 'TOOL',
  TREASURE = 'TREASURE',
  CLOTHING = 'CLOTHING',
  CONTAINER = 'CONTAINER',
  FOOD = 'FOOD',
  MOUNT = 'MOUNT',
  VEHICLE = 'VEHICLE',
  MISCELLANEOUS = 'MISCELLANEOUS'
}

/**
 * Item rarity enum
 */
export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  VERY_RARE = 'VERY_RARE',
  LEGENDARY = 'LEGENDARY',
  ARTIFACT = 'ARTIFACT'
}

/**
 * Item interface
 */
export interface Item {
  item_id: string;
  campaign_id: string;
  name: string;
  description?: string;
  item_type: ItemType;
  rarity?: ItemRarity;
  value?: number;
  weight?: number;
  properties?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Item creation parameters
 */
export interface ItemCreationParams {
  campaign_id: string;
  name: string;
  description?: string;
  item_type: ItemType;
  rarity?: ItemRarity;
  value?: number;
  weight?: number;
  properties?: string;
}

/**
 * Item update parameters
 */
export interface ItemUpdateParams {
  name?: string;
  description?: string;
  item_type?: ItemType;
  rarity?: ItemRarity;
  value?: number;
  weight?: number;
  properties?: string;
}

/**
 * Character item interface
 */
export interface CharacterItem {
  character_item_id: string;
  character_id: string;
  item_id: string;
  quantity: number;
  notes?: string;
  is_equipped: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Character item creation parameters
 */
export interface CharacterItemCreationParams {
  character_id: string;
  item_id: string;
  quantity: number;
  notes?: string;
  is_equipped?: boolean;
}

/**
 * Character item update parameters
 */
export interface CharacterItemUpdateParams {
  quantity?: number;
  notes?: string;
  is_equipped?: boolean;
}

/**
 * Location item interface
 */
export interface LocationItem {
  location_item_id: string;
  location_id: string;
  item_id: string;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Location item creation parameters
 */
export interface LocationItemCreationParams {
  location_id: string;
  item_id: string;
  quantity: number;
  notes?: string;
}

/**
 * Location item update parameters
 */
export interface LocationItemUpdateParams {
  quantity?: number;
  notes?: string;
}
