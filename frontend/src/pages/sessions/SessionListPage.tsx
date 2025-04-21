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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  Campaign as CampaignIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import SessionService, { Session } from '../../services/api/session.service';
import CampaignService, { Campaign } from '../../services/api/campaign.service';

const SessionListPage: React.FC = () => {
  const navigate = useNavigate();

  // State for Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // State for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for menu and dialog
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch Sessions and Campaigns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingCampaigns(true);
        setError(null);

        // Fetch sessions
        const sessionsData = await SessionService.getAllSessions();
        setSessions(sessionsData);
        setFilteredSessions(sessionsData);

        // Fetch campaigns
        const campaignsData = await CampaignService.getAllCampaigns();
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
        setLoadingCampaigns(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting when sessions, search query, filters, or sort options change
  useEffect(() => {
    let result = [...sessions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (session) =>
          session.name.toLowerCase().includes(query) ||
          session.description.toLowerCase().includes(query) ||
          (session.campaignName && session.campaignName.toLowerCase().includes(query))
      );
    }

    // Apply campaign filter
    if (campaignFilter !== 'all') {
      result = result.filter((session) => session.campaignId === campaignFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'campaign':
          comparison = (a.campaignName || '').localeCompare(b.campaignName || '');
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredSessions(result);
  }, [sessions, searchQuery, campaignFilter, sortOption, sortDirection]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle campaign filter change
  const handleCampaignFilterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCampaignFilter(e.target.value as string);
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
      // Set new option with default direction
      setSortOption(option);
      // Default to descending for date (newest first), ascending for others
      setSortDirection(option === 'date' ? 'desc' : 'asc');
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

  // Handle session menu
  const handleSessionMenuOpen = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const handleSessionMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
  };

  // Handle session actions
  const handleViewSession = (sessionId: string) => {
    navigate(/sessions/);
    handleSessionMenuClose();
  };

  const handleEditSession = (event: React.MouseEvent, sessionId: string) => {
    event.stopPropagation();
    navigate(/sessions//edit);
    handleSessionMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleSessionMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedSessionId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSessionId) return;

    try {
      await SessionService.deleteSession(selectedSessionId);
      setSessions(sessions.filter((session) => session.id !== selectedSessionId));
      setDeleteDialogOpen(false);
      setSelectedSessionId(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session. Please try again.');
    }
  };

  const handleCreateSession = () => {
    navigate('/sessions/create');
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(/sessions/);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return ${hours}h m;
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={skeleton-}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant=\
rectangular\ height={140} />
          <CardContent>
            <Skeleton variant=\text\ height={32} width=\80%\ />
            <Skeleton variant=\text\ height={20} width=\50%\ />
            <Skeleton variant=\text\ height={20} width=\40%\ />
            <Skeleton variant=\text\ height={80} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth=\lg\>
      <PageHeader
        title=\Sessions\
        subtitle=\Manage
your
RPG
sessions\
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sessions' },
        ]}
        action={
          <Button
            variant=\contained\
            color=\primary\
            startIcon={<AddIcon />}
            onClick={handleCreateSession}
          >
            Create Session
          </Button>
        }
      />

      {/* Search, filter, and sort bar */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder=\Search
sessions...\
          variant=\outlined\
          size=\small\
          fullWidth
          sx={{ flexGrow: 1, minWidth: '200px', maxWidth: { xs: '100%', sm: '300px' } }}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position=\start\>
                <SearchIcon color=\action\ />
              </InputAdornment>
            ),
          }}
        />

        <FormControl
          size=\small\
          sx={{ minWidth: '150px', flexGrow: { xs: 1, md: 0 } }}
        >
          <InputLabel id=\campaign-filter-label\>Campaign</InputLabel>
          <Select
            labelId=\campaign-filter-label\
            id=\campaign-filter\
            value={campaignFilter}
            label=\Campaign\
            onChange={handleCampaignFilterChange}
          >
            <MenuItem value=\all\>All Campaigns</MenuItem>
            {campaigns.map((campaign) => (
              <MenuItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title=\Sort
sessions\>
          <Button
            variant=\outlined\
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            size=\medium\
          >
            {sortOption === 'name' ? 'Name' :
             sortOption === 'date' ? 'Date' :
             sortOption === 'duration' ? 'Duration' :
             sortOption === 'campaign' ? 'Campaign' :
             sortOption === 'created' ? 'Created' :
             sortOption === 'updated' ? 'Updated' : 'Sort'}
            {sortDirection === 'asc' ? ' ↑' : ' ↓'}
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
            Name {sortOption === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('date')}
            selected={sortOption === 'date'}
          >
            Date {sortOption === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('duration')}
            selected={sortOption === 'duration'}
          >
            Duration {sortOption === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('campaign')}
            selected={sortOption === 'campaign'}
          >
            Campaign {sortOption === 'campaign' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => handleSortOptionSelect('created')}
            selected={sortOption === 'created'}
          >
            Created Date {sortOption === 'created' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSortOptionSelect('updated')}
            selected={sortOption === 'updated'}
          >
            Updated Date {sortOption === 'updated' && (sortDirection === 'asc' ? '↑' : '↓')}
          </MenuItem>
        </Menu>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity=\error\ sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && filteredSessions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant=\h6\ gutterBottom>
            {searchQuery || campaignFilter !== 'all'
              ? 'No sessions match your filters'
              : 'No sessions yet'}
          </Typography>
          <Typography variant=\body1\ color=\text.secondary\ paragraph>
            {searchQuery || campaignFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first session to get started'}
          </Typography>
          {!searchQuery && campaignFilter === 'all' && (
            <Button
              variant=\contained\
              color=\primary\
              startIcon={<AddIcon />}
              onClick={handleCreateSession}
              sx={{ mt: 2 }}
            >
              Create Session
            </Button>
          )}
        </Box>
      )}

      {/* Session grid */}
      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : (
          filteredSessions.map((session) => (
            <Grid item xs={12} sm={6} md={4} key={session.id}>
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
                onClick={() => handleSessionClick(session.id)}
              >
                <CardMedia
                  component=\img\
                  height=\140\
                  image={session.imageUrl || '/placeholder-session.jpg'}
                  alt={session.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant=\h6\ component=\div\ gutterBottom>
                      {session.name}
                    </Typography>
                    <IconButton
                      size=\small\
                      onClick={(e) => handleSessionMenuOpen(e, session.id)}
                      aria-label=\session
options\
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    {session.campaignName && (
                      <Chip
                        label={session.campaignName}
                        size=\small\
                        color=\primary\
                        variant=\outlined\
                        icon={<CampaignIcon />}
                      />
                    )}
                    {session.hasTranscription && (
                      <Chip
                        label=\Transcribed\
                        size=\small\
                        color=\success\
                        variant=\outlined\
                        icon={<MicIcon />}
                      />
                    )}
                  </Box>

                  <Typography
                    variant=\body2\
                    color=\text.secondary\
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {session.description}
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <CalendarTodayIcon fontSize=\small\ color=\action\ sx={{ mr: 0.5 }} />
                      <Typography variant=\body2\ color=\text.secondary\>
                        {formatDate(session.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize=\small\ color=\action\ sx={{ mr: 0.5 }} />
                      <Typography variant=\body2\ color=\text.secondary\>
                        {formatDuration(session.duration)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Session options menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleSessionMenuClose}
      >
        <MenuItem onClick={() => selectedSessionId && handleViewSession(selectedSessionId)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem onClick={(e) => selectedSessionId && handleEditSession(e, selectedSessionId)}>
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
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this session? This action cannot be undone.
            All associated transcriptions and data will be permanently deleted.
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

export default SessionListPage;
