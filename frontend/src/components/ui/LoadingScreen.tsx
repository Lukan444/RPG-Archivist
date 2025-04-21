import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  height?: number | string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullScreen = false,
  height = 400,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullScreen ? '100vh' : height,
        width: '100%',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      {message && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingScreen;
