import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import express from 'express';
import config from '../config';

/**
 * Initialize Sentry error reporting
 */
export const initErrorReporting = (): void => {
  // Only initialize in production
  if (config.nodeEnv !== 'production' || !config.sentry.dsn) {
    console.log('Error reporting disabled in development mode or missing DSN');
    return;
  }

  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express() }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,
    environment: config.nodeEnv,
    release: config.version || 'unknown',
    beforeSend(event) {
      // Don't send events in development
      if (config.nodeEnv !== 'production') {
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
  if (config.nodeEnv !== 'production') {
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

/**
 * Sentry request handler
 */
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

/**
 * Sentry error handler
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler() as express.ErrorRequestHandler;
