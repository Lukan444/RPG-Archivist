import React from 'react';
import { Alert, AlertTitle, Button, Box, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  fullPage = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullPage ? '100vh' : 'auto',
        width: '100%',
        p: 2,
      }}
    >
      <Paper
        elevation={fullPage ? 3 : 0}
        sx={{
          width: fullPage ? { xs: '100%', sm: '80%', md: '60%', lg: '50%' } : '100%',
          maxWidth: fullPage ? 600 : '100%',
          p: fullPage ? 3 : 0,
        }}
      >
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          }
          sx={{
            alignItems: 'center',
          }}
        >
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
      </Paper>
    </Box>
  );
};

export default ErrorMessage;
