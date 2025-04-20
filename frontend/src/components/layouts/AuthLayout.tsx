import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        py: 4,
      }}
    >
      {/* Logo and App Name */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant=\ h3\
          component=\h1\
          color=\primary\
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            textAlign: 'center',
          }}
        >
          RPG Archivist
        </Typography>
        <Typography
          variant=\subtitle1\
          color=\text.secondary\
          sx={{
            textAlign: 'center',
            maxWidth: '600px',
            mt: 1,
          }}
        >
          Your ultimate tool for managing tabletop RPG campaigns
        </Typography>
      </Box>

      {/* Auth Content */}
      <Container maxWidth=\sm\ sx={{ mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Outlet />
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component=\footer\
        sx={{
          mt: 'auto',
          py: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant=\body2\ color=\text.secondary\>
          © {new Date().getFullYear()} RPG Archivist. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;
