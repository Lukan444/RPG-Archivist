/**
 * Permission model
 */

import { UserRole } from './user.model';

/**
 * Permission enum
 */
export enum Permission {
  // User permissions
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',

  // Campaign permissions
  VIEW_CAMPAIGNS = 'VIEW_CAMPAIGNS',
  CREATE_CAMPAIGN = 'CREATE_CAMPAIGN',
  UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN',
  DELETE_CAMPAIGN = 'DELETE_CAMPAIGN',

  // Session permissions
  VIEW_SESSIONS = 'VIEW_SESSIONS',
  CREATE_SESSION = 'CREATE_SESSION',
  UPDATE_SESSION = 'UPDATE_SESSION',
  DELETE_SESSION = 'DELETE_SESSION',

  // Character permissions
  VIEW_CHARACTERS = 'VIEW_CHARACTERS',
  CREATE_CHARACTER = 'CREATE_CHARACTER',
  UPDATE_CHARACTER = 'UPDATE_CHARACTER',
  DELETE_CHARACTER = 'DELETE_CHARACTER',

  // Location permissions
  VIEW_LOCATIONS = 'VIEW_LOCATIONS',
  CREATE_LOCATION = 'CREATE_LOCATION',
  UPDATE_LOCATION = 'UPDATE_LOCATION',
  DELETE_LOCATION = 'DELETE_LOCATION',

  // Transcription permissions
  VIEW_TRANSCRIPTIONS = 'VIEW_TRANSCRIPTIONS',
  CREATE_TRANSCRIPTION = 'CREATE_TRANSCRIPTION',
  UPDATE_TRANSCRIPTION = 'UPDATE_TRANSCRIPTION',
  DELETE_TRANSCRIPTION = 'DELETE_TRANSCRIPTION',

  // RPG World permissions
  VIEW_RPG_WORLDS = 'VIEW_RPG_WORLDS',
  CREATE_RPG_WORLD = 'CREATE_RPG_WORLD',
  UPDATE_RPG_WORLD = 'UPDATE_RPG_WORLD',
  DELETE_RPG_WORLD = 'DELETE_RPG_WORLD',

  // System permissions
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',
  VIEW_LOGS = 'VIEW_LOGS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS'
}

/**
 * Role permissions map
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission)
  ],

  [UserRole.GAME_MASTER]: [
    // User permissions
    Permission.VIEW_USERS,

    // Campaign permissions
    Permission.VIEW_CAMPAIGNS,
    Permission.CREATE_CAMPAIGN,
    Permission.UPDATE_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,

    // Session permissions
    Permission.VIEW_SESSIONS,
    Permission.CREATE_SESSION,
    Permission.UPDATE_SESSION,
    Permission.DELETE_SESSION,

    // Character permissions
    Permission.VIEW_CHARACTERS,
    Permission.CREATE_CHARACTER,
    Permission.UPDATE_CHARACTER,
    Permission.DELETE_CHARACTER,

    // Location permissions
    Permission.VIEW_LOCATIONS,
    Permission.CREATE_LOCATION,
    Permission.UPDATE_LOCATION,
    Permission.DELETE_LOCATION,

    // Transcription permissions
    Permission.VIEW_TRANSCRIPTIONS,
    Permission.CREATE_TRANSCRIPTION,
    Permission.UPDATE_TRANSCRIPTION,
    Permission.DELETE_TRANSCRIPTION,

    // RPG World permissions
    Permission.VIEW_RPG_WORLDS,
    Permission.CREATE_RPG_WORLD,
    Permission.UPDATE_RPG_WORLD
  ],

  [UserRole.PLAYER]: [
    // User permissions
    Permission.VIEW_USERS,

    // Campaign permissions (only campaigns they are part of)
    Permission.VIEW_CAMPAIGNS,

    // Session permissions (only sessions they are part of)
    Permission.VIEW_SESSIONS,

    // Character permissions (only their own characters)
    Permission.VIEW_CHARACTERS,
    Permission.CREATE_CHARACTER,
    Permission.UPDATE_CHARACTER,

    // Location permissions
    Permission.VIEW_LOCATIONS,

    // Transcription permissions (only transcriptions from sessions they are part of)
    Permission.VIEW_TRANSCRIPTIONS,

    // RPG World permissions
    Permission.VIEW_RPG_WORLDS
  ],

  [UserRole.VIEWER]: [
    // User permissions
    Permission.VIEW_USERS,

    // Campaign permissions (only campaigns they have access to)
    Permission.VIEW_CAMPAIGNS,

    // Session permissions (only sessions they have access to)
    Permission.VIEW_SESSIONS,

    // Character permissions
    Permission.VIEW_CHARACTERS,

    // Location permissions
    Permission.VIEW_LOCATIONS,

    // Transcription permissions (only transcriptions from sessions they have access to)
    Permission.VIEW_TRANSCRIPTIONS,

    // RPG World permissions
    Permission.VIEW_RPG_WORLDS
  ]
};
