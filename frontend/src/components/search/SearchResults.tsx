import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Person as CharacterIcon,
  Place as LocationIcon,
  Event as EventIcon,
  Book as CampaignIcon,
  Public as WorldIcon,
  Description as NoteIcon
} from '@mui/icons-material';

export interface SearchResult {
  id: string;
  type: 'character' | 'location' | 'event' | 'campaign' | 'world' | 'note';
  title: string;
  description?: string;
  tags?: string[];
  url?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  error?: string | null;
  onResultClick?: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading = false,
  error = null,
  onResultClick
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'character':
        return <CharacterIcon />;
      case 'location':
        return <LocationIcon />;
      case 'event':
        return <EventIcon />;
      case 'campaign':
        return <CampaignIcon />;
      case 'world':
        return <WorldIcon />;
      case 'note':
        return <NoteIcon />;
      default:
        return <NoteIcon />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No results found.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <List>
        {results.map((result, index) => (
          <React.Fragment key={result.id}>
            {index > 0 && <Divider component="li" />}
            <ListItem
              onClick={() => onResultClick && onResultClick(result)}
              sx={{ py: 1.5, cursor: 'pointer' }}
            >
              <ListItemIcon>
                {getIcon(result.type)}
              </ListItemIcon>
              <ListItemText
                primary={result.title}
                secondary={
                  <Box>
                    {result.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {result.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={getTypeLabel(result.type)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {result.tags?.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SearchResults;
