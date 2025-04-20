import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

// Import components
import { MainLayout, AuthLayout } from './components/layouts';
import { LoadingScreen } from './components/ui';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));

// RPG World pages
const RPGWorldListPage = lazy(() => import('./pages/rpg-worlds/RPGWorldListPage'));
const RPGWorldDetailPage = lazy(() => import('./pages/rpg-worlds/RPGWorldDetailPage'));
const RPGWorldCreatePage = lazy(() => import('./pages/rpg-worlds/RPGWorldCreatePage'));
const RPGWorldEditPage = lazy(() => import('./pages/rpg-worlds/RPGWorldEditPage'));

// Campaign pages
const CampaignListPage = lazy(() => import('./pages/campaigns/CampaignListPage'));
const CampaignDetailPage = lazy(() => import('./pages/campaigns/CampaignDetailPage'));
const CampaignCreatePage = lazy(() => import('./pages/campaigns/CampaignCreatePage'));
const CampaignEditPage = lazy(() => import('./pages/campaigns/CampaignEditPage'));

// Create a simple HomePage component
const HomePageComponent: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <Typography variant= h2 component=h1 align=center>
      Welcome to RPG Archivist Web
    </Typography>
  </Box>
);

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to=/login state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path=/ element={<HomePageComponent />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path=/login element={<LoginPage />} />
          <Route path=/register element={<RegisterPage />} />
          <Route path=/forgot-password element={<ForgotPasswordPage />} />
          <Route path=/reset-password element={<ResetPasswordPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* User routes */}
          <Route path=/profile element={<ProfilePage />} />
          <Route path=/settings element={<SettingsPage />} />
          
          {/* RPG World routes */}
          <Route path=/rpg-worlds element={<RPGWorldListPage />} />
          <Route path=/rpg-worlds/create element={<RPGWorldCreatePage />} />
          <Route path=/rpg-worlds/:id element={<RPGWorldDetailPage />} />
          <Route path=/rpg-worlds/:id/edit element={<RPGWorldEditPage />} />
          
          {/* Campaign routes */}
          <Route path=/campaigns element={<CampaignListPage />} />
          <Route path=/campaigns/create element={<CampaignCreatePage />} />
          <Route path=/campaigns/:id element={<CampaignDetailPage />} />
          <Route path=/campaigns/:id/edit element={<CampaignEditPage />} />
          
          {/* Temporary placeholder routes */}
          <Route path=/dashboard element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Dashboard</Typography>
              <Typography variant=body1>Dashboard content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/sessions element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Sessions</Typography>
              <Typography variant=body1>Sessions content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/characters element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Characters</Typography>
              <Typography variant=body1>Characters content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/locations element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Locations</Typography>
              <Typography variant=body1>Locations content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/mind-map element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Mind Map</Typography>
              <Typography variant=body1>Mind Map content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/transcription element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Transcription</Typography>
              <Typography variant=body1>Transcription content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/brain element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Brain</Typography>
              <Typography variant=body1>Brain content will be implemented soon.</Typography>
            </Box>
          } />
        </Route>

        {/* 404 page */}
        <Route path=* element={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Container maxWidth=sm>
              <Typography variant=h2 align=center gutterBottom>404</Typography>
              <Typography variant=h5 align=center gutterBottom>Page Not Found</Typography>
              <Typography variant=body1 align=center>
                The page you are looking for does not exist or has been moved.
              </Typography>
            </Container>
          </Box>
        } />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
