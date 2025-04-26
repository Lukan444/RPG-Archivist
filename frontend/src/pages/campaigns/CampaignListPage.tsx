import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  ListItemIcon,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import CampaignService, { Campaign } from '../../services/api/campaign.service';
import RPGWorldService, { RPGWorld } from '../../services/api/rpgWorld.service';

const CampaignListPage: React.FC = () => {
  const navigate = useNavigate();

  // State for Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for RPG Worlds
  const [worlds, setWorlds] = useState<RPGWorld[]>([]);
  const [loadingWorlds, setLoadingWorlds] = useState(true);

  // State for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State for menu and dialog
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch Campaigns and Worlds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingWorlds(true);
        setError(null);

        // Fetch campaigns
        const campaignsData = await CampaignService.getCampaigns();
        setCampaigns(campaignsData);
        setFilteredCampaigns(campaignsData);

        // Fetch worlds
        const worldsData = await RPGWorldService.getRPGWorlds();
        setWorlds(worldsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load campaigns. Please try again.');
      } finally {
        setLoading(false);
        setLoadingWorlds(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting when campaigns, search query, filters, or sort options change
  useEffect(() => {
    let result = [...campaigns];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(query) ||
          (campaign.description && campaign.description.toLowerCase().includes(query)) ||
          (campaign.worldName && campaign.worldName.toLowerCase().includes(query))
      );
    }

    // Apply world filter
    if (worldFilter !== 'all') {
      result = result.filter((campaign) => campaign.worldId === worldFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((campaign) => campaign.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'world':
          comparison = (a.worldName || '').localeCompare(b.worldName || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'sessions':
          comparison = (a.sessionCount || 0) - (b.sessionCount || 0);
          break;
        case 'created':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt || '').getTime() - new Date(b.updatedAt || '').getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredCampaigns(result);
  }, [campaigns, searchQuery, worldFilter, statusFilter, sortOption, sortDirection]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle world filter change
  const handleWorldFilterChange = (e: SelectChangeEvent<string>) => {
    setWorldFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    setStatusFilter(e.target.value);
  };

  // Handle sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };

  const handleSortOptionSelect = (option: string) => {
    if (option === sortOption) {
      // Toggle direction if same option
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new option with default ascending direction
      setSortOption(option);
      setSortDirection('asc');
    }
    handleSortMenuClose();
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };

  // Handle campaign menu
  const handleCampaignMenuOpen = (event: React.MouseEvent<HTMLElement>, campaignId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedCampaignId(campaignId);
  };

  const handleCampaignMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCampaignId(null);
  };

  // Handle campaign actions
  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
    handleCampaignMenuClose();
  };

  const handleEditCampaign = (event: React.MouseEvent, campaignId: string) => {
    event.stopPropagation();
    navigate(`/campaigns/${campaignId}/edit`);
    handleCampaignMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleCampaignMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCampaignId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCampaignId) return;

    try {
      await CampaignService.deleteCampaign(selectedCampaignId);
      setCampaigns(campaigns.filter((campaign) => campaign.id !== selectedCampaignId));
      setDeleteDialogOpen(false);
      setSelectedCampaignId(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setError('Failed to delete campaign. Please try again.');
    }
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  const handleCampaignClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'planned':
        return 'info';
      case 'completed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant="rectangular" height={140} />
          <CardContent>
            <Skeleton variant="text" height={32} width="80%" />
            <Skeleton variant="text" height={20} width="50%" />
            <Skeleton variant="text" height={20} width="40%" />
            <Skeleton variant="text" height={80} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Campaigns"
        subtitle="Manage your RPG campaigns"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns' },
        ]}
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </Button>
        }
      />

      {/* Search, filter, and sort bar */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search campaigns..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ flexGrow: 1, minWidth: '200px', maxWidth: { xs: '100%', sm: '300px' } }}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl
          size="small"
          sx={{ minWidth: '150px', flexGrow: { xs: 1, md: 0 } }}
        >
          <InputLabel id="world-filter-label">World</InputLabel>
          <Select
            labelId="world-filter-label"
            id="world-filter"
            value={worldFilter}
            label="World"
            onChange={handleWorldFilterChange}
          >
            <MenuItem value="all">All Worlds</MenuItem>
            {worlds.map((world) => (
              <MenuItem key={world.id} value={world.id}>
                {world.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: '120px', flexGrow: { xs: 1, md: 0 } }}
        >
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Sort campaigns">
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            size="medium"
          >
            {sortOption === 'name' ? 'Name' :
             sortOption === 'world' ? 'World' :
             sortOption === 'status' ? 'Status' :
             sortOption === 'sessions' ? 'Sessions' :
             sortOption === 'created' ? 'Created' :
             sortOption === 'updated' ? 'Updated' : 'Sort'}
            {sortDirection === 'asc' ? ' ^' : ' �'}
          </Button>
        </Tooltip>

        <Menu
          anchorEl={sortMenuAnchorEl}
          open={Boolean(sortMenuAnchorEl)}
          onClose={handleSortMenuClose}
        >
          <MenuItem
            onClick={() => handleSortOptionSelect('name')}
            selected={sortOption === 'name'}
          >
            Name {sortOption === 'name' && (sortDirection === 'asc' ? '^' : '�')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('world')}
            selected={sortOption === 'world'}
          >
            World {sortOption === 'world' && (sortDirection === 'asc' ? '^' : '�')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('status')}
            selected={sortOption === 'status'}
          >
            Status {sortOption === 'status' && (sortDirection === 'asc' ? '^' : '�')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('sessions')}
            selected={sortOption === 'sessions'}
          >
            Sessions {sortOption === 'sessions' && (sortDirection === 'asc' ? '^' : '�')}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => handleSortOptionSelect('created')}
            selected={sortOption === 'created'}
          >
            Created Date {sortOption === 'created' && (sortDirection === 'asc' ? '^' : '�')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('updated')}
            selected={sortOption === 'updated'}
          >
            Updated Date {sortOption === 'updated' && (sortDirection === 'asc' ? '^' : '�')}
          </MenuItem>
        </Menu>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && filteredCampaigns.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchQuery || worldFilter !== 'all' || statusFilter !== 'all'
              ? 'No campaigns match your filters'
              : 'No campaigns yet'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchQuery || worldFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first campaign to get started'}
          </Typography>
          {!searchQuery && worldFilter === 'all' && statusFilter === 'all' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateCampaign}
              sx={{ mt: 2 }}
            >
              Create Campaign
            </Button>
          )}
        </Box>
      )}

      {/* Campaign grid */}
      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : (
          filteredCampaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleCampaignClick(campaign.id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={campaign.imageUrl || '/placeholder-campaign.jpg'}
                  alt={campaign.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {campaign.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleCampaignMenuOpen(e, campaign.id)}
                      aria-label="campaign options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Unknown'}
                      size="small"
                      color={getStatusColor(campaign.status || '') as any}
                      variant="outlined"
                    />
                    {campaign.worldName && (
                      <Chip
                        label={campaign.worldName}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {campaign.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <EventIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {campaign.sessionCount || 0} {campaign.sessionCount === 1 ? 'Session' : 'Sessions'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Campaign options menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCampaignMenuClose}
      >
        <MenuItem onClick={() => selectedCampaignId && handleViewCampaign(selectedCampaignId)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem onClick={(e) => selectedCampaignId && handleEditCampaign(e, selectedCampaignId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this campaign? This action cannot be undone.
            All associated sessions and data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignListPage;
