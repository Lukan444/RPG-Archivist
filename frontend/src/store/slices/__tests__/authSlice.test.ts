import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  clearError,
  clearSuccessMessage,
  setSuccessMessage
} from '../authSlice';
import AuthService, { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, User } from '../../../services/api/auth.service';

// Define RootState type for tests
interface RootState {
  auth: ReturnType<typeof authReducer>;
}

// Mock the AuthService
jest.mock('../../../services/api/auth.service', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getCurrentUser: jest.fn(),
  getStoredUser: jest.fn(),
  isAuthenticated: jest.fn(),
  storeAuthData: jest.fn()
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock initial state
    (AuthService.getStoredUser as jest.Mock).mockReturnValue(null);
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

    // Create store with auth reducer
    store = configureStore<RootState>({
      reducer: {
        auth: authReducer
      }
    });
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        successMessage: null
      });
    });

    it('should use stored user and authentication status', () => {
      // Mock stored user and authentication status
      const mockUser: User = {
        user_id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        created_at: '2023-01-01T00:00:00Z'
      };
      (AuthService.getStoredUser as jest.Mock).mockReturnValue(mockUser);
      (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);

      // Create new store to use the mocked values
      const newStore = configureStore<RootState>({
        reducer: {
          auth: authReducer
        }
      });

      const state = newStore.getState().auth;
      expect(state).toEqual({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        successMessage: null
      });
    });
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      // Set initial state with an error
      store.dispatch(setSuccessMessage('Test message'));
      store.dispatch({ type: 'auth/login/rejected', payload: 'Test error' });

      // Clear error
      store.dispatch(clearError());

      // Check state
      const state = store.getState().auth;
      expect(state.error).toBeNull();
      expect(state.successMessage).toBe('Test message'); // Should not affect other state
    });

    it('should handle clearSuccessMessage', () => {
      // Set initial state with a success message
      store.dispatch(setSuccessMessage('Test message'));

      // Clear success message
      store.dispatch(clearSuccessMessage());

      // Check state
      const state = store.getState().auth;
      expect(state.successMessage).toBeNull();
    });

    it('should handle setSuccessMessage', () => {
      // Set success message
      store.dispatch(setSuccessMessage('Test message'));

      // Check state
      const state = store.getState().auth;
      expect(state.successMessage).toBe('Test message');
    });
  });

  describe('async thunks', () => {
    describe('login', () => {
      it('should handle login.pending', () => {
        // Dispatch login.pending action
        store.dispatch({ type: login.pending.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should handle login.fulfilled', () => {
        // Mock user data
        const userData: User = {
          user_id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z'
        };

        // Dispatch login.fulfilled action
        store.dispatch({
          type: login.fulfilled.type,
          payload: { user: userData, token: 'test-token' }
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(userData);
        expect(state.error).toBeNull();
      });

      it('should handle login.rejected', () => {
        // Dispatch login.rejected action
        store.dispatch({
          type: login.rejected.type,
          payload: 'Invalid credentials'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('Invalid credentials');
      });

      it('should call AuthService.login and handle success', async () => {
        // Mock successful login
        const credentials: LoginRequest = { email: 'test@example.com', password: 'password' };
        const userData: User = {
          user_id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z'
        };
        const response = { data: { user: userData, token: 'test-token' } };

        (AuthService.login as jest.Mock).mockResolvedValue(response);

        // Dispatch login action
        await store.dispatch(login(credentials));

        // Check if AuthService.login was called with correct arguments
        expect(AuthService.login).toHaveBeenCalledWith(credentials);

        // Check if AuthService.storeAuthData was called with correct arguments
        expect(AuthService.storeAuthData).toHaveBeenCalledWith('test-token', userData);

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(userData);
        expect(state.error).toBeNull();
      });

      it('should handle login error', async () => {
        // Mock login error
        const credentials: LoginRequest = { email: 'test@example.com', password: 'password' };
        const error = { response: { data: { error: { message: 'Invalid credentials' } } } };

        (AuthService.login as jest.Mock).mockRejectedValue(error);

        // Dispatch login action
        await store.dispatch(login(credentials));

        // Check if AuthService.login was called with correct arguments
        expect(AuthService.login).toHaveBeenCalledWith(credentials);

        // Check if AuthService.storeAuthData was not called
        expect(AuthService.storeAuthData).not.toHaveBeenCalled();

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('Invalid credentials');
      });
    });

    describe('register', () => {
      it('should handle register.pending', () => {
        // Dispatch register.pending action
        store.dispatch({ type: register.pending.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should handle register.fulfilled', () => {
        // Mock user data
        const userData: User = {
          user_id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z'
        };

        // Dispatch register.fulfilled action
        store.dispatch({
          type: register.fulfilled.type,
          payload: { user: userData, token: 'test-token' }
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(userData);
        expect(state.error).toBeNull();
        expect(state.successMessage).toBe('Registration successful!');
      });

      it('should handle register.rejected', () => {
        // Dispatch register.rejected action
        store.dispatch({
          type: register.rejected.type,
          payload: 'Username already exists'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Username already exists');
      });

      it('should call AuthService.register and handle success', async () => {
        // Mock successful registration
        const userData: RegisterRequest = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password'
        };
        const responseData = {
          user: {
            user_id: 'test-user-id',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
            created_at: '2023-01-01T00:00:00Z'
          },
          token: 'test-token'
        };
        const response = { data: responseData };

        (AuthService.register as jest.Mock).mockResolvedValue(response);

        // Dispatch register action
        await store.dispatch(register(userData));

        // Check if AuthService.register was called with correct arguments
        expect(AuthService.register).toHaveBeenCalledWith(userData);

        // Check if AuthService.storeAuthData was called with correct arguments
        expect(AuthService.storeAuthData).toHaveBeenCalledWith('test-token', responseData.user);

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(responseData.user);
        expect(state.error).toBeNull();
        expect(state.successMessage).toBe('Registration successful!');
      });

      it('should handle register error', async () => {
        // Mock registration error
        const userData: RegisterRequest = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password'
        };
        const error = { response: { data: { error: { message: 'Username already exists' } } } };

        (AuthService.register as jest.Mock).mockRejectedValue(error);

        // Dispatch register action
        await store.dispatch(register(userData));

        // Check if AuthService.register was called with correct arguments
        expect(AuthService.register).toHaveBeenCalledWith(userData);

        // Check if AuthService.storeAuthData was not called
        expect(AuthService.storeAuthData).not.toHaveBeenCalled();

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Username already exists');
      });
    });

    describe('logout', () => {
      it('should handle logout.pending', () => {
        // Dispatch logout.pending action
        store.dispatch({ type: logout.pending.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
      });

      it('should handle logout.fulfilled', () => {
        // Set initial state with a user
        store.dispatch({
          type: login.fulfilled.type,
          payload: {
            user: {
              user_id: 'test-user-id',
              username: 'testuser',
              email: 'test@example.com',
              role: 'user',
              created_at: '2023-01-01T00:00:00Z'
            },
            token: 'test-token'
          }
        });

        // Dispatch logout.fulfilled action
        store.dispatch({ type: logout.fulfilled.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBeNull();
      });

      it('should handle logout.rejected', () => {
        // Dispatch logout.rejected action
        store.dispatch({
          type: logout.rejected.type,
          payload: 'Failed to logout'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Failed to logout');
      });

      it('should call AuthService.logout and handle success', async () => {
        // Mock successful logout
        (AuthService.logout as jest.Mock).mockResolvedValue(true);

        // Dispatch logout action
        await store.dispatch(logout());

        // Check if AuthService.logout was called
        expect(AuthService.logout).toHaveBeenCalled();

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBeNull();
      });

      it('should handle logout error', async () => {
        // Mock logout error
        const error = { response: { data: { error: { message: 'Failed to logout' } } } };

        (AuthService.logout as jest.Mock).mockRejectedValue(error);

        // Dispatch logout action
        await store.dispatch(logout());

        // Check if AuthService.logout was called
        expect(AuthService.logout).toHaveBeenCalled();

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Failed to logout');
      });
    });

    describe('forgotPassword', () => {
      it('should handle forgotPassword.pending', () => {
        // Dispatch forgotPassword.pending action
        store.dispatch({ type: forgotPassword.pending.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMessage).toBeNull();
      });

      it('should handle forgotPassword.fulfilled', () => {
        // Dispatch forgotPassword.fulfilled action
        store.dispatch({ type: forgotPassword.fulfilled.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.successMessage).toBe('Password reset email sent. Please check your inbox.');
      });

      it('should handle forgotPassword.rejected', () => {
        // Dispatch forgotPassword.rejected action
        store.dispatch({
          type: forgotPassword.rejected.type,
          payload: 'Email not found'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Email not found');
      });

      it('should call AuthService.forgotPassword and handle success', async () => {
        // Mock successful forgotPassword
        (AuthService.forgotPassword as jest.Mock).mockResolvedValue(true);

        // Dispatch forgotPassword action
        const forgotPasswordData: ForgotPasswordRequest = { email: 'test@example.com' };
        await store.dispatch(forgotPassword(forgotPasswordData));

        // Check if AuthService.forgotPassword was called with correct arguments
        expect(AuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.successMessage).toBe('Password reset email sent. Please check your inbox.');
      });

      it('should handle forgotPassword error', async () => {
        // Mock forgotPassword error
        const error = { response: { data: { error: { message: 'Email not found' } } } };

        (AuthService.forgotPassword as jest.Mock).mockRejectedValue(error);

        // Dispatch forgotPassword action
        const forgotPasswordData: ForgotPasswordRequest = { email: 'test@example.com' };
        await store.dispatch(forgotPassword(forgotPasswordData));

        // Check if AuthService.forgotPassword was called with correct arguments
        expect(AuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Email not found');
      });
    });

    describe('resetPassword', () => {
      it('should handle resetPassword.pending', () => {
        // Dispatch resetPassword.pending action
        store.dispatch({ type: resetPassword.pending.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMessage).toBeNull();
      });

      it('should handle resetPassword.fulfilled', () => {
        // Dispatch resetPassword.fulfilled action
        store.dispatch({ type: resetPassword.fulfilled.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.successMessage).toBe('Password has been reset successfully. You can now login with your new password.');
      });

      it('should handle resetPassword.rejected', () => {
        // Dispatch resetPassword.rejected action
        store.dispatch({
          type: resetPassword.rejected.type,
          payload: 'Invalid token'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Invalid token');
      });

      it('should call AuthService.resetPassword and handle success', async () => {
        // Mock successful resetPassword
        (AuthService.resetPassword as jest.Mock).mockResolvedValue(true);

        // Dispatch resetPassword action
        const resetPasswordData: ResetPasswordRequest = {
          token: 'reset-token',
          password: 'new-password'
        };
        await store.dispatch(resetPassword(resetPasswordData));

        // Check if AuthService.resetPassword was called with correct arguments
        expect(AuthService.resetPassword).toHaveBeenCalledWith({
          token: 'reset-token',
          password: 'new-password'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.successMessage).toBe('Password has been reset successfully. You can now login with your new password.');
      });

      it('should handle resetPassword error', async () => {
        // Mock resetPassword error
        const error = { response: { data: { error: { message: 'Invalid token' } } } };

        (AuthService.resetPassword as jest.Mock).mockRejectedValue(error);

        // Dispatch resetPassword action
        const resetPasswordData: ResetPasswordRequest = {
          token: 'reset-token',
          password: 'new-password'
        };
        await store.dispatch(resetPassword(resetPasswordData));

        // Check if AuthService.resetPassword was called with correct arguments
        expect(AuthService.resetPassword).toHaveBeenCalledWith({
          token: 'reset-token',
          password: 'new-password'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Invalid token');
      });
    });

    describe('getCurrentUser', () => {
      it('should handle getCurrentUser.pending', () => {
        // Dispatch getCurrentUser.pending action
        store.dispatch({ type: getCurrentUser.pending.type });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should handle getCurrentUser.fulfilled', () => {
        // Mock user data
        const userData: User = {
          user_id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z'
        };

        // Dispatch getCurrentUser.fulfilled action
        store.dispatch({
          type: getCurrentUser.fulfilled.type,
          payload: userData
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(userData);
      });

      it('should handle getCurrentUser.rejected', () => {
        // Dispatch getCurrentUser.rejected action
        store.dispatch({
          type: getCurrentUser.rejected.type,
          payload: 'Failed to get user data'
        });

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('Failed to get user data');
      });

      it('should call AuthService.getCurrentUser and handle success', async () => {
        // Mock successful getCurrentUser
        const userData: User = {
          user_id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: '2023-01-01T00:00:00Z'
        };

        (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(userData);

        // Dispatch getCurrentUser action
        await store.dispatch(getCurrentUser());

        // Check if AuthService.getCurrentUser was called
        expect(AuthService.getCurrentUser).toHaveBeenCalled();

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(userData);
      });

      it('should handle getCurrentUser error', async () => {
        // Mock getCurrentUser error
        const error = { response: { data: { error: { message: 'Failed to get user data' } } } };

        (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(error);

        // Dispatch getCurrentUser action
        await store.dispatch(getCurrentUser());

        // Check if AuthService.getCurrentUser was called
        expect(AuthService.getCurrentUser).toHaveBeenCalled();

        // Check state
        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('Failed to get user data');
      });
    });
  });
});
