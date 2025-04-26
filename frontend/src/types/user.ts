export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: 'admin' | 'user';
  // Added missing properties
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  lastLogin?: string;
  name?: string;
  avatar?: string;
  preferences: {
    theme: 'system' | 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
    uiDensity: 'comfortable' | 'compact' | 'standard';
    showWelcomeScreen: boolean;
    autoSaveInterval: number;
    dateFormat: string;
    timeFormat: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
