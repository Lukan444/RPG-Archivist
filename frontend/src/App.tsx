import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";

// Import pages (to be created)
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import DashboardPage from "./pages/DashboardPage";
// import RPGWorldsPage from "./pages/RPGWorldsPage";
// import CampaignsPage from "./pages/CampaignsPage";
// import SessionsPage from "./pages/SessionsPage";
// import CharactersPage from "./pages/CharactersPage";
// import LocationsPage from "./pages/LocationsPage";
// import MindMapPage from "./pages/MindMapPage";
// import TranscriptionPage from "./pages/TranscriptionPage";
// import BrainPage from "./pages/BrainPage";
// import SettingsPage from "./pages/SettingsPage";
// import NotFoundPage from "./pages/NotFoundPage";

// Import components (to be created)
// import ProtectedRoute from "./components/ProtectedRoute";
// import MainLayout from "./components/layouts/MainLayout";

const App: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ flex: 1, padding: 0 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <Typography variant="h2" component="h1">
                Welcome to RPG Archivist Web
              </Typography>
            </Box>
          } />
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> */}

          {/* Protected routes */}
          {/* <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rpg-worlds" element={<RPGWorldsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/mind-map" element={<MindMapPage />} />
              <Route path="/transcription" element={<TranscriptionPage />} />
              <Route path="/brain" element={<BrainPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route> */}

          {/* Redirect to dashboard if logged in */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

          {/* 404 page */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
