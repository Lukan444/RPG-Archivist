import React, { createContext, useState, useContext, useEffect, ReactNode } from \ react\;
import { User } from \../services/api/user.service\;
import apiClient from \../services/api/client\;

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
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
        // Check if token exists in local storage
        const token = localStorage.getItem(\token\);
        
        if (token) {
          // Set token in API client
          apiClient.defaults.headers.common[\Authorization\] = Bearer ;
          
          // Fetch user profile
          const response = await apiClient.get(\/users/me\);
          const userData = response.data.data;
          
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error(\Error initializing auth:\, error);
        
        // Clear token and auth state
        localStorage.removeItem(\token\);
        delete apiClient.defaults.headers.common[\Authorization\];
        
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post(\/auth/login\, { email, password });
      const { token, user: userData } = response.data.data;
      
      // Save token to local storage
      localStorage.setItem(\token\, token);
      
      // Set token in API client
      apiClient.defaults.headers.common[\Authorization\] = Bearer ;
      
      // Update auth state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(\Error logging in:\, error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiClient.post(\/auth/logout\);
    } catch (error) {
      console.error(\Error logging out:\, error);
    } finally {
      // Clear token and auth state
      localStorage.removeItem(\token\);
      delete apiClient.defaults.headers.common[\Authorization\];
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.post(\/auth/register\, { username, email, password });
      const { token, user: userData } = response.data.data;
      
      // Save token to local storage
      localStorage.setItem(\token\, token);
      
      // Set token in API client
      apiClient.defaults.headers.common[\Authorization\] = Bearer ;
      
      // Update auth state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(\Error registering:\, error);
      throw error;
    }
  };
  
  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await apiClient.post(\/auth/forgot-password\, { email });
    } catch (error) {
      console.error(\Error requesting password reset:\, error);
      throw error;
    }
  };
  
  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      await apiClient.post(\/auth/reset-password\, { token, password });
    } catch (error) {
      console.error(\Error resetting password:\, error);
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
    throw new Error(\useAuth must be used within an AuthProvider\);
  }
  
  return context;
};
