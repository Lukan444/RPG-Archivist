// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Authentication configuration
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';

// File upload configuration
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Date format
export const DEFAULT_DATE_FORMAT = 'MMMM d, yyyy';
export const DEFAULT_TIME_FORMAT = 'h:mm a';
export const DEFAULT_DATETIME_FORMAT = 'MMMM d, yyyy h:mm a';

// Theme configuration
export const THEME_KEY = 'app_theme';
export const DEFAULT_THEME = 'light';

// Feature flags
export const FEATURES = {
  TRANSCRIPTION: true,
  CONTENT_ANALYSIS: true,
  VISUALIZATION: true,
  STORYTELLING: true,
  RELATIONSHIP_MANAGEMENT: true,
  EXPORT: true,
  IMPORT: true
};
