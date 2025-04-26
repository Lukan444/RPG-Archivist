import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import apiClient from '../services/api/client';

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateUser: (user: User) => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);

        // Check if token exists in local storage or session storage
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');
        const token = localToken || sessionToken;

        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        // Set token in API client
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // Try to get user from storage first (for faster initial load)
          const localUser = localStorage.getItem('user');
          const sessionUser = sessionStorage.getItem('user');
          const storedUser = localUser || sessionUser;

          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError);
              // Continue to fetch from API if parsing fails
            }
          }

          // Fetch current user data from API to ensure it's up to date
          // In development mode, we'll use the mock user data since the endpoint might not exist
          let userData;
          try {
            const response = await apiClient.get('/auth/me');
            userData = response.data.data;
          } catch (error) {
            console.warn('Could not fetch user data from /auth/me, trying /users/me');
            try {
              const response = await apiClient.get('/users/me');
              userData = response.data.data;
            } catch (innerError) {
              console.warn('Could not fetch user data from /users/me either, using stored user data');
              // If both endpoints fail, use the stored user data
              if (!storedUser) {
                throw new Error('Could not fetch user data from any endpoint');
              }
              userData = JSON.parse(storedUser);
            }
          }

          // Update auth state
          setUser(userData);
          setIsAuthenticated(true);

          // Update stored user data
          if (localToken) {
            localStorage.setItem('user', JSON.stringify(userData));
          } else if (sessionToken) {
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (apiError) {
          console.error('Error fetching user data:', apiError);

          // Clear token and auth state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete apiClient.defaults.headers.common['Authorization'];

          // In development mode, create a mock user
          if (process.env.NODE_ENV === 'development') {
            console.log('Creating mock user for development');
            const mockUser = {
              id: 'dev-user-id',
              username: 'Developer',
              email: 'dev@example.com',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              role: 'admin' as 'admin',
              preferences: {
                theme: 'system' as 'system' | 'light' | 'dark',
                language: 'en',
                notifications: {
                  email: true,
                  browser: true,
                  mobile: true
                },
                uiDensity: 'standard' as 'comfortable' | 'compact' | 'standard',
                showWelcomeScreen: true,
                autoSaveInterval: 5,
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h'
              }
            };

            // Store mock user in session storage
            const mockToken = 'dev-token-' + Math.random().toString(36).substring(2);
            sessionStorage.setItem('token', mockToken);
            sessionStorage.setItem('user', JSON.stringify(mockUser));

            // Set token in API client
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

            setUser(mockUser);
            setIsAuthenticated(true);
          } else {
            // In production, don't create a mock user
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);

        // Log detailed error information
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        } else {
          console.error('Unknown error type:', typeof error);
          console.error('Error details:', error);
        }

        // Clear token and auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        delete apiClient.defaults.headers.common['Authorization'];

        // In development mode, create a mock user
        if (process.env.NODE_ENV === 'development') {
          console.log('Creating mock user for development');
          const mockUser = {
            id: 'dev-user-id',
            username: 'Developer',
            email: 'dev@example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'admin' as 'admin',
            preferences: {
              theme: 'system' as 'system' | 'light' | 'dark',
              language: 'en',
              notifications: {
                email: true,
                browser: true,
                mobile: true
              },
              uiDensity: 'standard' as 'comfortable' | 'compact' | 'standard',
              showWelcomeScreen: true,
              autoSaveInterval: 5,
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h'
            }
          };

          // Store mock user in session storage
          const mockToken = 'dev-token-' + Math.random().toString(36).substring(2);
          sessionStorage.setItem('token', mockToken);
          sessionStorage.setItem('user', JSON.stringify(mockUser));

          // Set token in API client
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

          setUser(mockUser);
          setIsAuthenticated(true);
        } else {
          // In production, don't create a mock user
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Log login attempt
      console.log(`Attempting to login with email: ${email}, rememberMe: ${rememberMe}`);

      try {
        const response = await apiClient.post('/auth/login', { email, password, rememberMe });
        console.log('Login API response:', response.data);

        const { token, user: userData } = response.data.data;

        // Save token to storage based on rememberMe preference
        if (rememberMe) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(userData));
          // Clear any existing localStorage tokens to prevent conflicts
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }

        // Set token in API client
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Update auth state
        setUser(userData);
        setIsAuthenticated(true);

        console.log('Login successful');
      } catch (apiError) {
        console.error('Error logging in via API:', apiError);

        // Log detailed error information
        if (apiError instanceof Error) {
          console.error('Error name:', apiError.name);
          console.error('Error message:', apiError.message);
          console.error('Error stack:', apiError.stack);

          // Log axios specific error details if available
          if ('response' in apiError) {
            const axiosError = apiError as any;
            console.error('API Error Status:', axiosError.response?.status);
            console.error('API Error Data:', axiosError.response?.data);
          }
        }

        // For development mode only, create a mock user
        if (process.env.NODE_ENV === 'development') {
          console.log('Creating mock user for development');
          const mockToken = 'dev-token-' + Math.random().toString(36).substring(2);

          const mockUser = {
            id: 'dev-user-id',
            username: 'Developer',
            email: email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'admin' as 'admin',
            preferences: {
              theme: 'system' as 'system' | 'light' | 'dark',
              language: 'en',
              notifications: {
                email: true,
                browser: true,
                mobile: true
              },
              uiDensity: 'standard' as 'comfortable' | 'compact' | 'standard',
              showWelcomeScreen: true,
              autoSaveInterval: 5,
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h'
            }
          };

          // Save mock data based on rememberMe preference
          if (rememberMe) {
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
          } else {
            sessionStorage.setItem('token', mockToken);
            sessionStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }

          // Set token in API client
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

          setUser(mockUser);
          setIsAuthenticated(true);
        } else {
          // In production, propagate the error
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error in login function:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Clear token and auth state from both storage types
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Remove authorization header
      delete apiClient.defaults.headers.common['Authorization'];

      // Update auth state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      // Log registration attempt
      console.log(`Attempting to register with username: ${username}, email: ${email}`);

      try {
        const response = await apiClient.post('/auth/register', { username, email, password });
        console.log('Register API response:', response.data);

        const { token, user: userData } = response.data.data;

        // Save token to local storage
        localStorage.setItem('token', token);

        // Set token in API client
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Update auth state
        setUser(userData);
        setIsAuthenticated(true);

        console.log('Registration successful');
      } catch (apiError) {
        console.error('Error registering via API:', apiError);

        // Log detailed error information
        if (apiError instanceof Error) {
          console.error('Error name:', apiError.name);
          console.error('Error message:', apiError.message);
          console.error('Error stack:', apiError.stack);

          // Log axios specific error details if available
          if ('response' in apiError) {
            const axiosError = apiError as any;
            console.error('API Error Status:', axiosError.response?.status);
            console.error('API Error Data:', axiosError.response?.data);
          }
        }

        // For development mode only, create a mock user
        if (process.env.NODE_ENV === 'development') {
          console.log('Creating mock user for development');
          const mockToken = 'dev-token-' + Math.random().toString(36).substring(2);
          localStorage.setItem('token', mockToken);

          const mockUser = {
            id: 'dev-user-id',
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'admin' as 'admin',
            preferences: {
              theme: 'system' as 'system' | 'light' | 'dark',
              language: 'en',
              notifications: {
                email: true,
                browser: true,
                mobile: true
              },
              uiDensity: 'standard' as 'comfortable' | 'compact' | 'standard',
              showWelcomeScreen: true,
              autoSaveInterval: 5,
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h'
            }
          };

          setUser(mockUser);
          setIsAuthenticated(true);
        } else {
          // In production, propagate the error
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error in register function:', error);
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      await apiClient.post('/auth/reset-password', { token, password });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Auth context value
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth context hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
