import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Skeleton,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Campaign as CampaignIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Mic as MicIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  AudioFile as AudioFileIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { ImageGallery, ImageItem } from '../../components/images';
import SessionService, { Session } from '../../services/api/session.service';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for Session
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for menu and dialog
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for transcription
  const [transcription, setTranscription] = useState<any>(null);
  const [loadingTranscription, setLoadingTranscription] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Mock data for characters and locations
  const [characters, setCharacters] = useState<any[]>([
    { id: '1', name: 'Aragorn', type: 'NPC', race: 'Human', class: 'Ranger' },
    { id: '2', name: 'Gandalf', type: 'NPC', race: 'Wizard', class: 'Mage' },
    { id: '3', name: 'Legolas', type: 'PC', race: 'Elf', class: 'Archer' },
    { id: '4', name: 'Gimli', type: 'PC', race: 'Dwarf', class: 'Fighter' },
  ]);

  const [locations, setLocations] = useState<any[]>([
    { id: '1', name: 'Rivendell', type: 'City', description: 'Elven city' },
    { id: '2', name: 'Mordor', type: 'Region', description: 'Dark land' },
    { id: '3', name: 'Minas Tirith', type: 'City', description: 'White city' },
  ]);

  // Mock data for images
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
      title: 'Session Map',
      description: 'Created on 2023-01-15',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
      title: 'Battle Scene',
      description: 'Created on 2023-02-20',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      title: 'Treasure',
      description: 'Created on 2023-03-10',
    },
  ]);

  // Mock transcription data
  const mockTranscription = {
    segments: [
      { id: '1', speaker: 'DM', text: 'As you enter the dark cavern, you see glowing crystals on the walls.', start: 0, end: 5 },
      { id: '2', speaker: 'Aragorn', text: 'I want to examine the crystals. Are they magical?', start: 6, end: 10 },
      { id: '3', speaker: 'DM', text: 'Roll an Arcana check.', start: 11, end: 13 },
      { id: '4', speaker: 'Aragorn', text: 'I got a 15.', start: 14, end: 16 },
      { id: '5', speaker: 'DM', text: 'The crystals seem to be infused with magical energy. They pulse with a faint blue light.', start: 17, end: 25 },
    ],
    duration: 25,
  };

  // Fetch Session
  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await SessionService.getSession(id);
        setSession(data);

        // If session has transcription, fetch it
        if (data.hasTranscription) {
          fetchTranscription();
        }
      } catch (error) {
        console.error('Error fetching Session:', error);
        setError('Failed to load Session. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  // Fetch transcription
  const fetchTranscription = async () => {
    if (!id) return;

    try {
      setLoadingTranscription(true);
      setTranscriptionError(null);

      // In a real implementation, this would fetch from the API
      // For now, we'll just use mock data
      // const data = await SessionService.getSessionTranscription(id);
      // setTranscription(data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTranscription(mockTranscription);
    } catch (error) {
      console.error('Error fetching transcription:', error);
      setTranscriptionError('Failed to load transcription. Please try again.');
    } finally {
      setLoadingTranscription(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle edit
  const handleEdit = () => {
    if (id) {
      navigate(`/sessions/${id}/edit`);
    }
    handleMenuClose();
  };

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await SessionService.deleteSession(id);
      navigate('/sessions');
    } catch (error) {
      console.error('Error deleting Session:', error);
      setError('Failed to delete Session. Please try again.');
    }
  };

  // Handle image actions
  const handleImageDelete = (imageId: string) => {
    setImages(images.filter((image) => image.id !== imageId));
  };

  const handleImageEdit = (imageId: string) => {
    console.log('Edit image:', imageId);
  };

  // Handle navigation to related entities
  const handleCampaignClick = () => {
    if (session?.campaignId) {
      navigate(`/campaigns/${session.campaignId}`);
    }
  };

  const handleCharacterClick = (characterId: string) => {
    navigate(`/characters/${characterId}`);
  };

  const handleLocationClick = (locationId: string) => {
    navigate(`/locations/${locationId}`);
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
    return `${hours}h ${mins}m`;
  };

  // Render loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" height={40} width="50%" />
          <Skeleton variant="text" height={24} width="30%" />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={32} width="40%" />
            <Skeleton variant="text" height={24} width="20%" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="80%" />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Render error state
  if (error || !session) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || 'Session not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/sessions')}
          sx={{ mt: 2 }}
        >
          Back to Sessions
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={session.name}
        subtitle={`${formatDate(session.date)} | ${session.campaignName || 'No Campaign'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sessions', href: '/sessions' },
          { label: session.name },
        ]}
        actions={
          <>
            <IconButton
              aria-label="session options"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                Edit
              </MenuItem>
              <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete
              </MenuItem>
            </Menu>
          </>
        }
      />

      <Grid container spacing={3}>
        {/* Session image and details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ overflow: 'hidden', borderRadius: 2, mb: 3 }}>
            <Box
              component="img"
              src={session.imageUrl || '/placeholder-session.jpg'}
              alt={session.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 300,
                objectFit: 'cover',
              }}
            />
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Session Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Date
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">{formatDate(session.date)}</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Duration
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">{formatDuration(session.duration)}</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Campaign
              </Typography>
              <Button
                variant="text"
                color="primary"
                startIcon={<CampaignIcon />}
                onClick={handleCampaignClick}
                sx={{ pl: 0 }}
              >
                {session.campaignName || 'View Campaign'}
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Recordings & Analysis
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AudioFileIcon />}
                  onClick={() => navigate(`/sessions/${id}/recordings`)}
                  fullWidth
                >
                  Recordings
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate(`/sessions/${id}/analysis`)}
                  fullWidth
                  disabled={!session.hasTranscription}
                >
                  AI Analysis
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(session.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Session content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="session tabs"
                sx={{ px: 2 }}
              >
                <Tab label="Overview" id="session-tab-0" aria-controls="session-tabpanel-0" />
                <Tab label="Transcription" id="session-tab-1" aria-controls="session-tabpanel-1" disabled={!session.hasTranscription} />
                <Tab label="Characters" id="session-tab-2" aria-controls="session-tabpanel-2" />
                <Tab label="Locations" id="session-tab-3" aria-controls="session-tabpanel-3" />
                <Tab label="Gallery" id="session-tab-4" aria-controls="session-tabpanel-4" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {session.description}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <PersonIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h4">{characters.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Characters
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <LocationIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h4">{locations.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Locations
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <AccessTimeIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h4">{formatDuration(session.duration)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <MicIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h4">{session.hasTranscription ? 'Yes' : 'No'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Transcribed
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Transcription Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Transcription
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MicIcon />}
                >
                  Edit Transcription
                </Button>
              </Box>

              {loadingTranscription ? (
                <Box sx={{ py: 4 }}>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={40} />
                </Box>
              ) : transcriptionError ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {transcriptionError}
                </Alert>
              ) : transcription ? (
                <Box>
                  <List>
                    {transcription.segments.map((segment: any) => (
                      <ListItem
                        key={segment.id}
                        alignItems="flex-start"
                        sx={{
                          mb: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: segment.speaker === 'DM' ? 'secondary.main' : 'primary.main' }}>
                            {segment.speaker.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {segment.speaker}
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')} -
                                {Math.floor(segment.end / 60)}:{(segment.end % 60).toString().padStart(2, '0')}
                              </Typography>
                            </Typography>
                          }
                          secondary={segment.text}
                        />
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MicIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No transcription available for this session
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Characters Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Characters
              </Typography>

              {characters.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No characters in this session yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {characters.map((character) => (
                    <Grid item xs={12} sm={6} md={4} key={character.id}>
                      <Card>
                        <CardContent
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleCharacterClick(character.id)}
                        >
                          <Typography variant="h6" component="div">
                            {character.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {character.race} {character.class}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={character.type}
                              color={character.type === 'PC' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Locations Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Locations
              </Typography>

              {locations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No locations in this session yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {locations.map((location) => (
                    <Grid item xs={12} sm={6} key={location.id}>
                      <Card>
                        <CardContent
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleLocationClick(location.id)}
                        >
                          <Typography variant="h6" component="div">
                            {location.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {location.description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={location.type}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Gallery Tab */}
            <TabPanel value={tabValue} index={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Image Gallery
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => console.log('Add image')}
                >
                  Add Image
                </Button>
              </Box>

              <ImageGallery
                images={images}
                // onDelete={handleImageDelete}
                // onEdit={handleImageEdit}
              />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {session.name}? This action cannot be undone.
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

export default SessionDetailPage;
