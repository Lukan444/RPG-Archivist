import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry error reporting
 */
export const initErrorReporting = (): void => {
  // Only initialize in production
  if (process.env.NODE_ENV !== 'production' || !process.env.REACT_APP_SENTRY_DSN) {
    console.log('Error reporting disabled in development mode or missing DSN');
    return;
  }

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
    environment: process.env.REACT_APP_ENV || 'production',
    release: process.env.REACT_APP_VERSION || 'unknown',
    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV !== 'production') {
        return null;
      }
      return event;
    },
  });
};

/**
 * Report an error to Sentry
 * @param error Error to report
 * @param context Additional context information
 */
export const reportError = (error: Error, context?: Record<string, any>): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error, 'Context:', context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

/**
 * Set user information for error reporting
 * @param user User information
 */
export const setUserContext = (user: { id: string; email?: string; username?: string }): void => {
  Sentry.setUser(user);
};

/**
 * Clear user information from error reporting
 */
export const clearUserContext = (): void => {
  Sentry.setUser(null);
};
