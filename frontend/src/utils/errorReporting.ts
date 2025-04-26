import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { isProduction, isDevelopment, getSentryDsn, getEnvironment, getVersion } from './environment';

/**
 * Initialize Sentry error reporting
 */
export const initErrorReporting = (): void => {
  // Only initialize in production
  const dsn = getSentryDsn();
  if (!isProduction() || !dsn) {
    console.log('Error reporting disabled in development mode or missing DSN');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
    environment: getEnvironment(),
    release: getVersion(),
    beforeSend(event) {
      // Don't send events in development
      if (isDevelopment()) {
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
  if (isDevelopment()) {
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
