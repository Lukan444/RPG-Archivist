/**
 * User role enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  GAME_MASTER = 'GAME_MASTER',
  PLAYER = 'PLAYER',
  VIEWER = 'VIEWER'
}

/**
 * User model
 */
export interface User {
  /**
   * Unique identifier for the User
   */
  user_id: string;

  /**
   * Username
   */
  username: string;

  /**
   * Email address
   */
  email: string;

  /**
   * Password (hashed)
   */
  password?: string;

  /**
   * Full name
   */
  name?: string;

  /**
   * User role (admin, user, etc.)
   */
  role?: UserRole;

  /**
   * Creation timestamp
   */
  created_at?: number;

  /**
   * Last update timestamp
   */
  updated_at?: number;

  /**
   * Profile image URL
   */
  profile_image_url?: string;

  /**
   * User settings
   */
  settings?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
    [key: string]: any;
  };
}