import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import apiClient from '../../services/api/client';

// Mock the API client
jest.mock('../../services/api/client', () => ({
  defaults: {
    headers: {
      common: {}
    }
  },
  get: jest.fn(),
  post: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateUser
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button
        data-testid="login-button"
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button
        data-testid="logout-button"
        onClick={() => logout()}
      >
        Logout
      </button>
      <button
        data-testid="register-button"
        onClick={() => register('testuser', 'test@example.com', 'password')}
      >
        Register
      </button>
      <button
        data-testid="forgot-password-button"
        onClick={() => forgotPassword('test@example.com')}
      >
        Forgot Password
      </button>
      <button
        data-testid="reset-password-button"
        onClick={() => resetPassword('reset-token', 'new-password')}
      >
        Reset Password
      </button>
      <button
        data-testid="update-user-button"
        onClick={() => updateUser({ id: 'test-user-id', username: 'updated-user', email: 'test@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-01', role: 'user', preferences: { theme: 'system', language: 'en', notifications: { email: true, browser: true, mobile: true }, uiDensity: 'standard', showWelcomeScreen: true, autoSaveInterval: 5, dateFormat: 'MM/DD/YYYY', timeFormat: '12h' } })}
      >
        Update User
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Reset API client headers
    apiClient.defaults.headers.common = {};
  });

  it('should initialize with loading state', async () => {
    // Mock API response
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          user_id: 'test-user-id',
          username: 'testuser'
        }
      }
    });

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check initial loading state
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('should initialize with stored token and fetch user data', async () => {
    // Set token in localStorage
    mockLocalStorage.setItem('token', 'test-token');

    // Mock API response
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          user_id: 'test-user-id',
          username: 'testuser'
        }
      }
    });

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Check if token was used in API call
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    expect(apiClient.get).toHaveBeenCalledWith('/users/me');

    // Check if user data was set
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(JSON.parse(screen.getByTestId('user').textContent as string)).toEqual({
      user_id: 'test-user-id',
      username: 'testuser'
    });
  });

  it('should handle initialization error', async () => {
    // Set token in localStorage
    mockLocalStorage.setItem('token', 'test-token');

    // Mock API error
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch user'));

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Check if token was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();

    // Check if auth state was reset
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should handle login successfully', async () => {
    // Mock API response
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: {
            user_id: 'test-user-id',
            username: 'testuser'
          }
        }
      }
    });

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click login button
    await act(async () => {
      screen.getByTestId('login-button').click();
    });

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });

    // Check if token was stored
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer test-token');

    // Check if auth state was updated
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(JSON.parse(screen.getByTestId('user').textContent as string)).toEqual({
      user_id: 'test-user-id',
      username: 'testuser'
    });
  });

  it('should handle login error', async () => {
    // Mock API error
    (apiClient.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click login button and expect error
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('login-button').click();
      });
    }).rejects.toThrow();

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });

    // Check if token was not stored
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

    // Check if auth state was not updated
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should handle logout successfully', async () => {
    // Set initial authenticated state
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          user_id: 'test-user-id',
          username: 'testuser'
        }
      }
    });
    mockLocalStorage.setItem('token', 'test-token');

    // Mock logout API response
    (apiClient.post as jest.Mock).mockResolvedValue({});

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    // Click logout button
    await act(async () => {
      screen.getByTestId('logout-button').click();
    });

    // Check if API was called
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');

    // Check if token was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();

    // Check if auth state was reset
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should handle logout error', async () => {
    // Set initial authenticated state
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          user_id: 'test-user-id',
          username: 'testuser'
        }
      }
    });
    mockLocalStorage.setItem('token', 'test-token');

    // Mock logout API error
    (apiClient.post as jest.Mock).mockRejectedValue(new Error('Failed to logout'));

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    // Click logout button
    await act(async () => {
      screen.getByTestId('logout-button').click();
    });

    // Check if API was called
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');

    // Check if token was removed even if API call failed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();

    // Check if auth state was reset
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should handle register successfully', async () => {
    // Mock API response
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: {
            user_id: 'test-user-id',
            username: 'testuser'
          }
        }
      }
    });

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click register button
    await act(async () => {
      screen.getByTestId('register-button').click();
    });

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    });

    // Check if token was stored
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer test-token');

    // Check if auth state was updated
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(JSON.parse(screen.getByTestId('user').textContent as string)).toEqual({
      user_id: 'test-user-id',
      username: 'testuser'
    });
  });

  it('should handle register error', async () => {
    // Mock API error
    (apiClient.post as jest.Mock).mockRejectedValue(new Error('Username already exists'));

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click register button and expect error
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('register-button').click();
      });
    }).rejects.toThrow();

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    });

    // Check if token was not stored
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

    // Check if auth state was not updated
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should handle forgot password successfully', async () => {
    // Mock API response
    (apiClient.post as jest.Mock).mockResolvedValue({});

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click forgot password button
    await act(async () => {
      screen.getByTestId('forgot-password-button').click();
    });

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'test@example.com'
    });
  });

  it('should handle forgot password error', async () => {
    // Mock API error
    (apiClient.post as jest.Mock).mockRejectedValue(new Error('Email not found'));

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click forgot password button and expect error
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('forgot-password-button').click();
      });
    }).rejects.toThrow();

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'test@example.com'
    });
  });

  it('should handle reset password successfully', async () => {
    // Mock API response
    (apiClient.post as jest.Mock).mockResolvedValue({});

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click reset password button
    await act(async () => {
      screen.getByTestId('reset-password-button').click();
    });

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset-token',
      password: 'new-password'
    });
  });

  it('should handle reset password error', async () => {
    // Mock API error
    (apiClient.post as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click reset password button and expect error
    await expect(async () => {
      await act(async () => {
        screen.getByTestId('reset-password-button').click();
      });
    }).rejects.toThrow();

    // Check if API was called with correct arguments
    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset-token',
      password: 'new-password'
    });
  });

  it('should update user', async () => {
    // Render component
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click update user button
    await act(async () => {
      screen.getByTestId('update-user-button').click();
    });

    // Check if user was updated
    expect(JSON.parse(screen.getByTestId('user').textContent as string)).toEqual({
      user_id: 'test-user-id',
      username: 'updated-user'
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Expect error when rendering TestComponent without AuthProvider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });
});
