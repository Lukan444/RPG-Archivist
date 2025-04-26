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
  Check as ApproveIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import {
  ChangeProposalService,
  ChangeProposal,
  ProposalStatus,
  ProposalType,
  ProposalEntityType,
  ProposalFilterOptions
} from '../../services/api/change-proposal.service';
import { formatDistanceToNow } from 'date-fns';
import { adaptSelectChangeHandler } from '../../utils/eventHandlers';

interface ProposalListProps {
  contextId?: string;
  entityId?: string;
  entityType?: ProposalEntityType;
  onSelectProposal?: (proposalId: string) => void;
}

const ProposalList: React.FC<ProposalListProps> = ({
  contextId,
  entityId,
  entityType,
  onSelectProposal
}) => {
  const [proposals, setProposals] = useState<ChangeProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProposalFilterOptions>({
    status: [ProposalStatus.PENDING]
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Initialize filter with props
    const initialFilter: ProposalFilterOptions = {
      status: [ProposalStatus.PENDING]
    };

    if (contextId) {
      initialFilter.contextId = contextId;
    }

    if (entityId) {
      initialFilter.entityId = entityId;
    }

    if (entityType) {
      initialFilter.entityType = [entityType];
    }

    setFilter(initialFilter);
  }, [contextId, entityId, entityType]);

  useEffect(() => {
    fetchProposals();
  }, [filter]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Apply search to filter if provided
      const searchFilter = { ...filter };
      if (search) {
        searchFilter.search = search;
      }

      const proposals = await ChangeProposalService.getProposals(searchFilter);
      setProposals(proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearch = () => {
    fetchProposals();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = event.target;

    if (name) {
      setFilter(prevFilter => ({
        ...prevFilter,
        [name]: value
      }));
    }
  };

  // Create an adapter for Material UI's SelectChangeEvent
  const adaptedHandleFilterChange = adaptSelectChangeHandler(handleFilterChange);

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    const baseFilter: ProposalFilterOptions = {};

    // Keep context and entity filters if provided as props
    if (contextId) {
      baseFilter.contextId = contextId;
    }

    if (entityId) {
      baseFilter.entityId = entityId;
    }

    if (entityType) {
      baseFilter.entityType = [entityType];
    }

    setFilter(baseFilter);
    setSearch('');
  };

  const handleSelectProposal = (proposalId: string) => {
    if (onSelectProposal) {
      onSelectProposal(proposalId);
    }
  };

  const handleDeleteProposal = async (proposalId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await ChangeProposalService.deleteProposal(proposalId);

      // Refresh proposals
      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      setError('Failed to delete proposal. Please try again.');
    }
  };

  const handleQuickApprove = async (proposalId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await ChangeProposalService.reviewProposal(proposalId, ProposalStatus.APPROVED);

      // Refresh proposals
      fetchProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      setError('Failed to approve proposal. Please try again.');
    }
  };

  const handleQuickReject = async (proposalId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await ChangeProposalService.reviewProposal(proposalId, ProposalStatus.REJECTED);

      // Refresh proposals
      fetchProposals();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      setError('Failed to reject proposal. Please try again.');
    }
  };

  const getStatusColor = (status: ProposalStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'warning';
      case ProposalStatus.APPROVED:
        return 'success';
      case ProposalStatus.REJECTED:
        return 'error';
      case ProposalStatus.MODIFIED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ProposalStatus): string => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'Pending';
      case ProposalStatus.APPROVED:
        return 'Approved';
      case ProposalStatus.REJECTED:
        return 'Rejected';
      case ProposalStatus.MODIFIED:
        return 'Modified';
      default:
        return status;
    }
  };

  const getEntityTypeName = (type: ProposalEntityType): string => {
    switch (type) {
      case ProposalEntityType.WORLD:
        return 'World';
      case ProposalEntityType.CAMPAIGN:
        return 'Campaign';
      case ProposalEntityType.SESSION:
        return 'Session';
      case ProposalEntityType.CHARACTER:
        return 'Character';
      case ProposalEntityType.LOCATION:
        return 'Location';
      case ProposalEntityType.ITEM:
        return 'Item';
      case ProposalEntityType.EVENT:
        return 'Event';
      case ProposalEntityType.POWER:
        return 'Power';
      case ProposalEntityType.RELATIONSHIP:
        return 'Relationship';
      default:
        return type;
    }
  };

  const getProposalTypeName = (type: ProposalType): string => {
    switch (type) {
      case ProposalType.CREATE:
        return 'Create';
      case ProposalType.UPDATE:
        return 'Update';
      case ProposalType.DELETE:
        return 'Delete';
      case ProposalType.RELATE:
        return 'Relate';
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
          Proposals
          {proposals.length > 0 && ` (${proposals.length})`}
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
          placeholder="Search proposals..."
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  name="status"
                  multiple
                  value={filter.status || []}
                  onChange={adaptedHandleFilterChange}
                  label="Status"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as ProposalStatus[]).map((value) => (
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
                  {Object.values(ProposalStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  name="type"
                  multiple
                  value={filter.type || []}
                  onChange={adaptedHandleFilterChange}
                  label="Type"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as ProposalType[]).map((value) => (
                        <Chip
                          key={value}
                          label={getProposalTypeName(value)}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(ProposalType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {getProposalTypeName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!entityType && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel id="entity-type-filter-label">Entity Type</InputLabel>
                  <Select
                    labelId="entity-type-filter-label"
                    id="entity-type-filter"
                    name="entityType"
                    multiple
                    value={filter.entityType || []}
                    onChange={adaptedHandleFilterChange}
                    label="Entity Type"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as ProposalEntityType[]).map((value) => (
                          <Chip
                            key={value}
                            label={getEntityTypeName(value)}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(ProposalEntityType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {getEntityTypeName(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : proposals.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          No proposals found
        </Typography>
      ) : (
        <List>
          {proposals.map((proposal) => (
            <React.Fragment key={proposal.id}>
              <ListItem
                button
                onClick={() => handleSelectProposal(proposal.id)}
                alignItems="flex-start"
                sx={{ py: 2 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {proposal.title}
                      </Typography>
                      <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={getStatusLabel(proposal.status)}
                          size="small"
                          color={getStatusColor(proposal.status)}
                        />
                        <Chip
                          label={getProposalTypeName(proposal.type)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={getEntityTypeName(proposal.entityType)}
                          size="small"
                          variant="outlined"
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
                        {proposal.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Created {formatDate(proposal.createdAt)}
                        {proposal.reviewedAt && ` • Reviewed ${formatDate(proposal.reviewedAt)}`}
                        {proposal.entityDetails && ` • Entity: ${proposal.entityDetails.name}`}
                        {proposal.contextDetails && ` • Context: ${proposal.contextDetails.name}`}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex' }}>
                    {proposal.status === ProposalStatus.PENDING && (
                      <React.Fragment>
                        <Tooltip title="Quick Approve">
                          <IconButton
                            edge="end"
                            aria-label="approve"
                            onClick={(e) => handleQuickApprove(proposal.id, e)}
                            color="success"
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quick Reject">
                          <IconButton
                            edge="end"
                            aria-label="reject"
                            onClick={(e) => handleQuickReject(proposal.id, e)}
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
                        onClick={() => handleSelectProposal(proposal.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteProposal(proposal.id, e)}
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

export default ProposalList;
