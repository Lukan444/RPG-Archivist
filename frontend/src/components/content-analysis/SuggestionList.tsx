import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  ContentAnalysisService,
  ContentSuggestion,
  SuggestionType,
  SuggestionStatus,
  ConfidenceLevel,
  ContentAnalysisFilterOptions
} from '../../services/api/content-analysis.service';
import { formatDistanceToNow } from 'date-fns';

interface SuggestionListProps {
  contextId?: string;
  contextType?: string;
  sourceId?: string;
  sourceType?: string;
  onSelectSuggestion?: (suggestionId: string) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({
  contextId,
  contextType,
  sourceId,
  sourceType,
  onSelectSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContentAnalysisFilterOptions>({
    status: [SuggestionStatus.PENDING]
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Initialize filter with props
    const initialFilter: ContentAnalysisFilterOptions = {
      status: [SuggestionStatus.PENDING]
    };

    if (contextId) {
      initialFilter.contextId = contextId;
    }

    if (contextType) {
      initialFilter.contextType = contextType;
    }

    if (sourceId) {
      initialFilter.sourceId = sourceId;
    }

    if (sourceType) {
      initialFilter.sourceType = sourceType;
    }

    setFilter(initialFilter);
  }, [contextId, contextType, sourceId, sourceType]);

  useEffect(() => {
    fetchSuggestions();
  }, [filter]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Apply search to filter if provided
      const searchFilter = { ...filter };
      if (search) {
        searchFilter.search = search;
      }

      const suggestions = await ContentAnalysisService.getSuggestions(searchFilter);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearch = () => {
    fetchSuggestions();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (event: SelectChangeEvent<any>) => {
    const { name, value } = event.target;

    if (name) {
      setFilter(prevFilter => ({
        ...prevFilter,
        [name]: value
      }));
    }
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    const baseFilter: ContentAnalysisFilterOptions = {};

    // Keep context and source filters if provided as props
    if (contextId) {
      baseFilter.contextId = contextId;
    }

    if (contextType) {
      baseFilter.contextType = contextType;
    }

    if (sourceId) {
      baseFilter.sourceId = sourceId;
    }

    if (sourceType) {
      baseFilter.sourceType = sourceType;
    }

    setFilter(baseFilter);
    setSearch('');
  };

  const handleSelectSuggestion = (suggestionId: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestionId);
    }
  };

  const handleDeleteSuggestion = async (suggestionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await ContentAnalysisService.deleteSuggestion(suggestionId);

      // Refresh suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      setError('Failed to delete suggestion. Please try again.');
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await ContentAnalysisService.acceptSuggestion(suggestionId);

      // Refresh suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      setError('Failed to accept suggestion. Please try again.');
    }
  };

  const handleRejectSuggestion = async (suggestionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await ContentAnalysisService.rejectSuggestion(suggestionId);

      // Refresh suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      setError('Failed to reject suggestion. Please try again.');
    }
  };

  const getStatusColor = (status: SuggestionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case SuggestionStatus.PENDING:
        return 'warning';
      case SuggestionStatus.ACCEPTED:
        return 'success';
      case SuggestionStatus.REJECTED:
        return 'error';
      case SuggestionStatus.MODIFIED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SuggestionStatus): string => {
    switch (status) {
      case SuggestionStatus.PENDING:
        return 'Pending';
      case SuggestionStatus.ACCEPTED:
        return 'Accepted';
      case SuggestionStatus.REJECTED:
        return 'Rejected';
      case SuggestionStatus.MODIFIED:
        return 'Modified';
      default:
        return status;
    }
  };

  const getConfidenceColor = (confidence: ConfidenceLevel): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (confidence) {
      case ConfidenceLevel.HIGH:
        return 'success';
      case ConfidenceLevel.MEDIUM:
        return 'primary';
      case ConfidenceLevel.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  const getSuggestionTypeName = (type: SuggestionType): string => {
    switch (type) {
      case SuggestionType.CHARACTER:
        return 'Character';
      case SuggestionType.LOCATION:
        return 'Location';
      case SuggestionType.ITEM:
        return 'Item';
      case SuggestionType.EVENT:
        return 'Event';
      case SuggestionType.RELATIONSHIP:
        return 'Relationship';
      case SuggestionType.LORE:
        return 'Lore';
      case SuggestionType.DIALOG:
        return 'Dialog';
      case SuggestionType.PLOT:
        return 'Plot';
      case SuggestionType.NOTE:
        return 'Note';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Suggestions
          {suggestions.length > 0 && ` (${suggestions.length})`}
        </Typography>

        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterIcon />}
            onClick={handleToggleFilters}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search suggestions..."
          value={search}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {showFilters && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  name="status"
                  multiple
                  value={filter.status || []}
                  onChange={handleFilterChange}
                  label="Status"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as SuggestionStatus[]).map((value) => (
                        <Chip
                          key={value}
                          label={getStatusLabel(value)}
                          size="small"
                          color={getStatusColor(value)}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(SuggestionStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  name="types"
                  multiple
                  value={filter.types || []}
                  onChange={handleFilterChange}
                  label="Type"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as SuggestionType[]).map((value) => (
                        <Chip
                          key={value}
                          label={getSuggestionTypeName(value)}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(SuggestionType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {getSuggestionTypeName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="confidence-filter-label">Confidence</InputLabel>
                <Select
                  labelId="confidence-filter-label"
                  id="confidence-filter"
                  name="confidence"
                  multiple
                  value={filter.confidence || []}
                  onChange={handleFilterChange}
                  label="Confidence"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as ConfidenceLevel[]).map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          color={getConfidenceColor(value)}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(ConfidenceLevel).map((confidence) => (
                    <MenuItem key={confidence} value={confidence}>
                      {confidence}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : suggestions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          No suggestions found
        </Typography>
      ) : (
        <List>
          {suggestions.map((suggestion) => (
            <React.Fragment key={suggestion.id}>
              <ListItem
                onClick={() => handleSelectSuggestion(suggestion.id)}
                alignItems="flex-start"
                sx={{ py: 2, cursor: 'pointer' }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {suggestion.title}
                      </Typography>
                      <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={getStatusLabel(suggestion.status)}
                          size="small"
                          color={getStatusColor(suggestion.status)}
                        />
                        <Chip
                          label={getSuggestionTypeName(suggestion.type)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={suggestion.confidence}
                          size="small"
                          color={getConfidenceColor(suggestion.confidence)}
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        component="span"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mb: 1
                        }}
                      >
                        {suggestion.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Created {formatDate(suggestion.createdAt)}
                        {suggestion.sourceDetails && ` • Source: ${suggestion.sourceDetails.name}`}
                        {suggestion.contextDetails && ` • Context: ${suggestion.contextDetails.name}`}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex' }}>
                    {suggestion.status === SuggestionStatus.PENDING && (
                      <React.Fragment>
                        <Tooltip title="Accept">
                          <IconButton
                            edge="end"
                            aria-label="accept"
                            onClick={(e) => handleAcceptSuggestion(suggestion.id, e)}
                            color="success"
                          >
                            <AcceptIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            edge="end"
                            aria-label="reject"
                            onClick={(e) => handleRejectSuggestion(suggestion.id, e)}
                            color="error"
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </React.Fragment>
                    )}
                    <Tooltip title="View Details">
                      <IconButton
                        edge="end"
                        aria-label="view"
                        onClick={() => handleSelectSuggestion(suggestion.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteSuggestion(suggestion.id, e)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default SuggestionList;
