import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { EmptyState } from '../ui';
import { EmptyState as DefaultEmptyStateImage } from '../../assets';

interface EntityListProps<T> {
  title: string;
  entities: T[] | undefined;
  renderEntity: (entity: T) => React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onAddNew?: () => void;
  addNewLabel?: string;
  emptyStateProps?: {
    title?: string;
    description?: string;
    image?: string | React.ReactNode;
  };
}

function EntityList<T>({
  title,
  entities,
  renderEntity,
  isLoading = false,
  error = null,
  onAddNew,
  addNewLabel = 'Add New',
  emptyStateProps
}: EntityListProps<T>) {
  const theme = useTheme();

  // Default empty state props
  const defaultEmptyTitle = `No ${title} Found`;
  const defaultEmptyDescription = `Create your first ${title.toLowerCase()} to get started`;

  // Combine default and provided empty state props
  const emptyTitle = emptyStateProps?.title || defaultEmptyTitle;
  const emptyDescription = emptyStateProps?.description || defaultEmptyDescription;
  const emptyImage = emptyStateProps?.image || DefaultEmptyStateImage;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          {title}
        </Typography>

        {onAddNew && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddNew}
            sx={{
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {addNewLabel}
          </Button>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'error.light',
            borderRadius: 2,
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h6">Error Loading {title}</Typography>
          <Typography variant="body1">{error.message}</Typography>
        </Box>
      ) : entities && entities.length > 0 ? (
        <Grid container spacing={3}>
          {entities.map((entity, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              {renderEntity(entity)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          image={emptyImage}
          actionLabel={onAddNew ? addNewLabel : undefined}
          onAction={onAddNew}
          sx={{ py: 6 }}
        />
      )}
    </Box>
  );
}

export default EntityList;
