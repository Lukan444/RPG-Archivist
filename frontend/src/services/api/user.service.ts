import apiClient from './client';
import { AxiosResponse } from 'axios';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  defaultWorldId?: string;
  defaultCampaignId?: string;
  uiDensity: 'comfortable' | 'compact' | 'standard';
  showWelcomeScreen: boolean;
  autoSaveInterval: number; // in minutes
  dateFormat: string;
  timeFormat: string;
}

// User update interface
export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// User preferences update interface
export interface UserPreferencesUpdateInput extends Partial<UserPreferences> {}

// User service
const UserService = {
  /**
   * Get current user profile
   * @returns User profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<{ success: boolean; data: User }> = await apiClient.get('/users/me');
    return response.data.data;
  },

  /**
   * Update user profile
   * @param data User update data
   * @returns Updated user profile
   */
  updateProfile: async (data: UserUpdateInput): Promise<User> => {
    const response: AxiosResponse<{ success: boolean; data: User }> = await apiClient.put('/users/me', data);
    return response.data.data;
  },

  /**
   * Update user preferences
   * @param preferences User preferences update data
   * @returns Updated user preferences
   */
  updatePreferences: async (preferences: UserPreferencesUpdateInput): Promise<UserPreferences> => {
    const response: AxiosResponse<{ success: boolean; data: UserPreferences }> = await apiClient.put('/users/me/preferences', preferences);
    return response.data.data;
  },

  /**
   * Upload user avatar
   * @param file Avatar image file
   * @returns Avatar URL
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response: AxiosResponse<{ success: boolean; data: { avatarUrl: string } }> = await apiClient.post(
      '/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.data.avatarUrl;
  },

  /**
   * Delete user avatar
   * @returns Success status
   */
  deleteAvatar: async (): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete('/users/me/avatar');
    return response.data.success;
  },

  /**
   * Change user password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.success;
  },

  /**
   * Get user activity
   * @param limit Maximum number of activities to return
   * @returns User activities
   */
  getUserActivity: async (limit: number = 10): Promise<any[]> => {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await apiClient.get('/users/me/activity', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get user statistics
   * @returns User statistics
   */
  getUserStats: async (): Promise<any> => {
    const response: AxiosResponse<{ success: boolean; data: any }> = await apiClient.get('/users/me/stats');
    return response.data.data;
  },
};

export default UserService;
