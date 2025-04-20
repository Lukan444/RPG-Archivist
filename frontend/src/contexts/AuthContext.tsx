import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getCurrentUser, logout } from "../store/slices/authSlice";
import AuthService from "../services/api/auth.service";

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  logout: () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  // Check authentication status on mount and when location changes
  useEffect(() => {
    const checkAuth = async () => {
      // If we have a token but no user data, fetch the user data
      if (AuthService.isAuthenticated() && !user) {
        dispatch(getCurrentUser());
      }
    };

    checkAuth();
  }, [dispatch, user, location.pathname]);

  // Logout handler
  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
