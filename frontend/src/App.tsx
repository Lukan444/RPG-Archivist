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
// const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const RPGWorldsPage = lazy(() => import('./pages/RPGWorldsPage'));
// const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
// const SessionsPage = lazy(() => import('./pages/SessionsPage'));
// const CharactersPage = lazy(() => import('./pages/CharactersPage'));
// const LocationsPage = lazy(() => import('./pages/LocationsPage'));
// const MindMapPage = lazy(() => import('./pages/MindMapPage'));
// const TranscriptionPage = lazy(() => import('./pages/TranscriptionPage'));
// const BrainPage = lazy(() => import('./pages/BrainPage'));
// const SettingsPage = lazy(() => import('./pages/SettingsPage'));
// const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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
          {/* <Route path=/dashboard element={<DashboardPage />} />
          <Route path=/rpg-worlds element={<RPGWorldsPage />} />
          <Route path=/campaigns element={<CampaignsPage />} />
          <Route path=/sessions element={<SessionsPage />} />
          <Route path=/characters element={<CharactersPage />} />
          <Route path=/locations element={<LocationsPage />} />
          <Route path=/mind-map element={<MindMapPage />} />
          <Route path=/transcription element={<TranscriptionPage />} />
          <Route path=/brain element={<BrainPage />} />
          <Route path=/settings element={<SettingsPage />} /> */}
          
          {/* Temporary placeholder routes */}
          <Route path=/dashboard element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Dashboard</Typography>
              <Typography variant=body1>Dashboard content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/rpg-worlds element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>RPG Worlds</Typography>
              <Typography variant=body1>RPG Worlds content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path=/campaigns element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Campaigns</Typography>
              <Typography variant=body1>Campaigns content will be implemented soon.</Typography>
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
          <Route path=/settings element={
            <Box sx={{ p: 3 }}>
              <Typography variant=h4 gutterBottom>Settings</Typography>
              <Typography variant=body1>Settings content will be implemented soon.</Typography>
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
