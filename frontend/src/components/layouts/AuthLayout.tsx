import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Paper, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { Logo, RpgLogo, RpgLettersLogo, AuthBackground } from '../../assets';

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${AuthBackground}) no-repeat center center`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.4) 0%, rgba(156, 39, 176, 0.4) 100%)',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {!isMobile && (
            <Grid item md={6}>
              <Box sx={{ p: 4, color: 'white' }}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  Welcome to RPG Archivist
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Your ultimate tool for managing tabletop RPG campaigns
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
                    Create immersive worlds, track complex campaigns, and let our AI assistant help you craft unforgettable adventures.
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
                    Join thousands of game masters and players who use RPG Archivist to enhance their tabletop gaming experience.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(30, 30, 50, 0.85)',
                border: '1px solid rgba(63, 81, 181, 0.3)',
              }}
            >
              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <Box
                  component="img"
                  src={RpgLettersLogo}
                  alt="RPG Archivist Logo"
                  sx={{
                    width: 240,
                    height: 'auto',
                    filter: 'drop-shadow(0 0 10px rgba(63, 81, 181, 0.7))',
                  }}
                />
              </Link>
              <Outlet />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          mt: 'auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
          &copy; {new Date().getFullYear()} RPG Archivist. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;
