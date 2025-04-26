import { initErrorReporting, reportError, setUserContext, clearUserContext } from '../errorReporting';
import * as Sentry from '@sentry/react';

// Mock Sentry
jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  withScope: jest.fn((callback) => {
    const scope = { setExtra: jest.fn() };
    callback(scope);
  }),
  captureException: jest.fn(),
  setUser: jest.fn()
}));

// Mock environment module
jest.mock('../environment', () => {
  const originalModule = jest.requireActual('../environment');
  return {
    ...originalModule,
    isProduction: jest.fn(),
    isDevelopment: jest.fn()
  };
});

describe('Error Reporting Utils', () => {
  // Mock console.log and console.error
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('initErrorReporting', () => {
    it('should initialize Sentry in production with DSN', () => {
      // Arrange
      const { isProduction, isDevelopment, getSentryDsn, getEnvironment, getVersion } = require('../environment');
      (isProduction as jest.Mock).mockReturnValue(true);
      (isDevelopment as jest.Mock).mockReturnValue(false);
      (getSentryDsn as jest.Mock).mockReturnValue('https://test-dsn@sentry.io/123');
      (getEnvironment as jest.Mock).mockReturnValue('staging');
      (getVersion as jest.Mock).mockReturnValue('1.0.0');

      // Act
      initErrorReporting();

      // Assert
      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test-dsn@sentry.io/123',
        integrations: [expect.any(Object)],
        tracesSampleRate: 0.2,
        environment: 'staging',
        release: '1.0.0',
        beforeSend: expect.any(Function)
      });
    });

    it('should not initialize Sentry in development', () => {
      // Arrange
      const { isProduction, isDevelopment, getSentryDsn } = require('../environment');
      (isProduction as jest.Mock).mockReturnValue(false);
      (isDevelopment as jest.Mock).mockReturnValue(true);
      (getSentryDsn as jest.Mock).mockReturnValue('https://test-dsn@sentry.io/123');

      // Act
      initErrorReporting();

      // Assert
      expect(console.log).toHaveBeenCalledWith('Error reporting disabled in development mode or missing DSN');
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should not initialize Sentry without DSN', () => {
      // Arrange
      const { isProduction, isDevelopment, getSentryDsn } = require('../environment');
      (isProduction as jest.Mock).mockReturnValue(true);
      (isDevelopment as jest.Mock).mockReturnValue(false);
      (getSentryDsn as jest.Mock).mockReturnValue('');

      // Act
      initErrorReporting();

      // Assert
      expect(console.log).toHaveBeenCalledWith('Error reporting disabled in development mode or missing DSN');
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should use default values for environment and release if not provided', () => {
      // Arrange
      const { isProduction, isDevelopment, getSentryDsn, getEnvironment, getVersion } = require('../environment');
      (isProduction as jest.Mock).mockReturnValue(true);
      (isDevelopment as jest.Mock).mockReturnValue(false);
      (getSentryDsn as jest.Mock).mockReturnValue('https://test-dsn@sentry.io/123');
      (getEnvironment as jest.Mock).mockReturnValue('production');
      (getVersion as jest.Mock).mockReturnValue('unknown');

      // Act
      initErrorReporting();

      // Assert
      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        environment: 'production',
        release: 'unknown'
      }));
    });

    it('should not send events in development mode', () => {
      // Arrange
      const { isProduction, isDevelopment, getSentryDsn } = require('../environment');
      (isProduction as jest.Mock).mockReturnValue(true);
      (isDevelopment as jest.Mock).mockReturnValue(false);
      (getSentryDsn as jest.Mock).mockReturnValue('https://test-dsn@sentry.io/123');

      // Act
      initErrorReporting();

      // Get beforeSend function
      const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      // Mock isDevelopment for beforeSend function
      (isDevelopment as jest.Mock).mockReturnValue(true);

      // Assert
      expect(beforeSend({ event: 'test' })).toBeNull();

      // Reset isDevelopment
      (isDevelopment as jest.Mock).mockReturnValue(false);

      // Assert
      expect(beforeSend({ event: 'test' })).toEqual({ event: 'test' });
    });
  });

  describe('reportError', () => {
    it('should report error to Sentry in production', () => {
      // Arrange
      const { isDevelopment } = require('../environment');
      (isDevelopment as jest.Mock).mockReturnValue(false);
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'testAction' };

      // Act
      reportError(error, context);

      // Assert
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should log error to console in development', () => {
      // Arrange
      const { isDevelopment } = require('../environment');
      (isDevelopment as jest.Mock).mockReturnValue(true);
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'testAction' };

      // Act
      reportError(error, context);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error:', error, 'Context:', context);
      expect(Sentry.withScope).not.toHaveBeenCalled();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should handle error without context', () => {
      // Arrange
      const { isDevelopment } = require('../environment');
      (isDevelopment as jest.Mock).mockReturnValue(false);
      const error = new Error('Test error');

      // Act
      reportError(error);

      // Assert
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  describe('setUserContext', () => {
    it('should set user context in Sentry', () => {
      // Arrange
      const user = { id: 'user123', email: 'test@example.com', username: 'testuser' };

      // Act
      setUserContext(user);

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it('should set user context with only ID', () => {
      // Arrange
      const user = { id: 'user123' };

      // Act
      setUserContext(user);

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });
  });

  describe('clearUserContext', () => {
    it('should clear user context in Sentry', () => {
      // Act
      clearUserContext();

      // Assert
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });
});
