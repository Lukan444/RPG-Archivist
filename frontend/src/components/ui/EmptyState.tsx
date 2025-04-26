import React from 'react';
import { Box, Typography, Button, SxProps, Theme } from '@mui/material';
import { EmptyState as EmptyStateImage } from '../../assets';
import { Add as AddIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  image?: string | React.ReactNode;
  sx?: SxProps<Theme>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  image = EmptyStateImage,
  sx = {}
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        textAlign: 'center',
        minHeight: '300px',
        ...sx
      }}
    >
      {typeof image === 'string' ? (
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{
            width: '100%',
            maxWidth: '300px',
            height: 'auto',
            marginBottom: 3
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            maxWidth: '300px',
            height: 'auto',
            marginBottom: 3
          }}
        >
          {image}
        </Box>
      )}

      {icon && (
        <Box sx={{ marginBottom: 2, color: 'primary.main' }}>
          {icon}
        </Box>
      )}

      <Typography variant="h5" color="primary" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
