import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

// Import components
import { MainLayout, AuthLayout } from './components/layouts';
import { LoadingScreen } from './components/ui';
import { SingleInstanceCheck } from './components/system';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));
const LLMSettingsPage = lazy(() => import('./pages/settings/LLMSettingsPage'));

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

// Session pages
const SessionListPage = lazy(() => import('./pages/sessions/SessionListPage'));
const SessionDetailPage = lazy(() => import('./pages/sessions/SessionDetailPage'));
const SessionCreatePage = lazy(() => import('./pages/sessions/SessionCreatePage'));
const SessionEditPage = lazy(() => import('./pages/sessions/SessionEditPage'));
const SessionRecordingsPage = lazy(() => import('./pages/SessionRecordingsPage'));
const SessionAnalysisPage = lazy(() => import('./pages/SessionAnalysisPage'));

// Character pages
const CharacterListPage = lazy(() => import('./pages/characters/CharacterListPage'));
const CharacterDetailPage = lazy(() => import('./pages/characters/CharacterDetailPage'));
const CharacterCreatePage = lazy(() => import('./pages/characters/CharacterCreatePage'));
const CharacterEditPage = lazy(() => import('./pages/characters/CharacterEditPage'));

// Location pages
const LocationListPage = lazy(() => import('./pages/locations/LocationListPage'));
const LocationDetailPage = lazy(() => import('./pages/locations/LocationDetailPage'));
const LocationCreatePage = lazy(() => import('./pages/locations/LocationCreatePage'));
const LocationEditPage = lazy(() => import('./pages/locations/LocationEditPage'));

// Event pages
const EventListPage = lazy(() => import('./pages/events/EventListPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const EventCreatePage = lazy(() => import('./pages/events/EventCreatePage'));
const EventEditPage = lazy(() => import('./pages/events/EventEditPage'));

// Timeline page
const TimelinePage = lazy(() => import('./pages/timeline/TimelinePage'));

// Mind Map page
const MindMapPage = lazy(() => import('./pages/mind-map/MindMapPage'));

// Brain page
const BrainPage = lazy(() => import('./pages/brain/BrainPage'));

// Proposals pages
const ProposalManagementPage = lazy(() => import('./pages/proposals/ProposalManagementPage'));

// Storytelling pages
const StorytellingPage = lazy(() => import('./pages/storytelling/StorytellingPage'));

// Content Analysis pages
const ContentAnalysisPage = lazy(() => import('./pages/content-analysis/ContentAnalysisPage'));

// Search page
const SearchPage = lazy(() => import('./pages/search/SearchPage'));

// HomePage is already imported above

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* User routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/llm" element={<LLMSettingsPage />} />

          {/* RPG World routes */}
          <Route path="/rpg-worlds" element={<RPGWorldListPage />} />
          <Route path="/rpg-worlds/create" element={<RPGWorldCreatePage />} />
          <Route path="/rpg-worlds/:id" element={<RPGWorldDetailPage />} />
          <Route path="/rpg-worlds/:id/edit" element={<RPGWorldEditPage />} />

          {/* Campaign routes */}
          <Route path="/campaigns" element={<CampaignListPage />} />
          <Route path="/campaigns/create" element={<CampaignCreatePage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:id/edit" element={<CampaignEditPage />} />

          {/* Session routes */}
          <Route path="/sessions" element={<SessionListPage />} />
          <Route path="/sessions/create" element={<SessionCreatePage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/sessions/:id/edit" element={<SessionEditPage />} />
          <Route path="/sessions/:sessionId/recordings" element={<SessionRecordingsPage />} />
          <Route path="/sessions/:sessionId/analysis" element={<SessionAnalysisPage />} />
          <Route path="/sessions/:sessionId/analysis/:transcriptionId" element={<SessionAnalysisPage />} />

          {/* Character routes */}
          <Route path="/characters" element={<CharacterListPage />} />
          <Route path="/characters/create" element={<CharacterCreatePage />} />
          <Route path="/characters/:id" element={<CharacterDetailPage />} />
          <Route path="/characters/:id/edit" element={<CharacterEditPage />} />

          {/* Location routes */}
          <Route path="/locations" element={<LocationListPage />} />
          <Route path="/locations/create" element={<LocationCreatePage />} />
          <Route path="/locations/:id" element={<LocationDetailPage />} />
          <Route path="/locations/:id/edit" element={<LocationEditPage />} />

          {/* Event routes */}
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/create" element={<EventCreatePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<EventEditPage />} />

          {/* Timeline route */}
          <Route path="/timeline" element={<TimelinePage />} />

          {/* Mind Map route */}
          <Route path="/mind-map" element={<MindMapPage />} />

          {/* Search route */}
          <Route path="/search" element={<SearchPage />} />

          {/* Temporary placeholder routes */}
          <Route path="/dashboard" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>Dashboard</Typography>
              <Typography variant="body1">Dashboard content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path="/transcription" element={
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>Transcription</Typography>
              <Typography variant="body1">Transcription content will be implemented soon.</Typography>
            </Box>
          } />
          <Route path="/brain" element={<BrainPage />} />

          {/* Proposals routes */}
          <Route path="/proposals" element={<ProposalManagementPage />} />
          <Route path="/proposals/context/:contextId" element={<ProposalManagementPage />} />
          <Route path="/proposals/entity/:entityType/:entityId" element={<ProposalManagementPage />} />

          {/* Storytelling routes */}
          <Route path="/storytelling" element={<StorytellingPage />} />
          <Route path="/storytelling/campaign/:campaignId" element={<StorytellingPage />} />
          <Route path="/storytelling/session/:sessionId" element={<StorytellingPage />} />

          {/* Content Analysis routes */}
          <Route path="/content-analysis" element={<ContentAnalysisPage />} />
          <Route path="/content-analysis/context/:contextId" element={<ContentAnalysisPage />} />
          <Route path="/content-analysis/entity/:entityType/:entityId" element={<ContentAnalysisPage />} />
          <Route path="/content-analysis/suggestion/:suggestionId" element={<ContentAnalysisPage />} />
          <Route path="/content-analysis/context/:contextId/suggestion/:suggestionId" element={<ContentAnalysisPage />} />
          <Route path="/content-analysis/entity/:entityType/:entityId/suggestion/:suggestionId" element={<ContentAnalysisPage />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Container maxWidth="sm">
              <Typography variant="h2" align="center" gutterBottom>404</Typography>
              <Typography variant="h5" align="center" gutterBottom>Page Not Found</Typography>
              <Typography variant="body1" align="center">
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
  const [isInstanceResolved, setIsInstanceResolved] = useState(false);

  const handleInstanceResolved = () => {
    setIsInstanceResolved(true);
  };

  return (
    <AuthProvider>
      {!isInstanceResolved ? (
        <SingleInstanceCheck
          onInstanceResolved={handleInstanceResolved}
        />
      ) : (
        <AppRoutes />
      )}
    </AuthProvider>
  );
};

export default App;
