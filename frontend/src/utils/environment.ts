/**
 * Environment utility functions
 */

/**
 * Check if the application is running in production mode
 * @returns True if in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if the application is running in development mode
 * @returns True if in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Get the Sentry DSN
 * @returns Sentry DSN or empty string
 */
export const getSentryDsn = (): string => {
  return process.env.REACT_APP_SENTRY_DSN || '';
};

/**
 * Get the environment name
 * @returns Environment name
 */
export const getEnvironment = (): string => {
  return process.env.REACT_APP_ENV || 'production';
};

/**
 * Get the application version
 * @returns Application version
 */
export const getVersion = (): string => {
  return process.env.REACT_APP_VERSION || 'unknown';
};
