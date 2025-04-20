import apiClient from './client';
import { AxiosResponse } from 'axios';

// User interface
export interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

// Auth response interface
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request interface
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Forgot password request interface
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request interface
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Auth service
const AuthService = {
  /**
   * Login user
   * @param credentials Login credentials
   * @returns Auth response
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register user
   * @param userData User registration data
   * @returns Auth response
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear auth data regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Request password reset
   * @param email User email
   * @returns Success response
   */
  forgotPassword: async (email: string): Promise<{ success: boolean }> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password
   * @param resetData Reset password data
   * @returns Success response
   */
  resetPassword: async (resetData: ResetPasswordRequest): Promise<{ success: boolean }> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  },

  /**
   * Get current user
   * @returns User data
   */
  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<{ success: boolean; data: User }> = await apiClient.get('/auth/me');
    return response.data.data;
  },

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get stored user data
   * @returns User data or null
   */
  getStoredUser: (): User | null => {
    const userJson = localStorage.getItem('auth_user');
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Store authentication data
   * @param token Auth token
   * @param user User data
   */
  storeAuthData: (token: string, user: User): void => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
};

export default AuthService;
