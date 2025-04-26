import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CardActionArea,
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/ui";
import { ImageGallery, ImageItem } from "../../components/images";
import CampaignService, { Campaign } from "../../services/api/campaign.service";

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
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for Campaign
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for menu and dialog
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mock data for sessions, characters, and locations
  const [sessions, setSessions] = useState<any[]>([
    { id: '1', name: 'Session 1: The Beginning', date: '2023-01-15', duration: 180 },
    { id: '2', name: 'Session 2: Into the Dungeon', date: '2023-01-22', duration: 210 },
    { id: '3', name: 'Session 3: The Dragon\'s Lair', date: '2023-01-29', duration: 240 },
  ]);

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
      title: 'Campaign Map',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
      title: 'Castle',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      title: 'Forest',
    },
  ]);

  // Fetch Campaign
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await CampaignService.getCampaign(id);
        setCampaign(data);
      } catch (error) {
        console.error('Error fetching Campaign:', error);
        setError('Failed to load Campaign. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

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
      navigate(`/campaigns/${id}/edit`);
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
      await CampaignService.deleteCampaign(id);
      navigate('/campaigns');
    } catch (error) {
      console.error('Error deleting Campaign:', error);
      setError('Failed to delete Campaign. Please try again.');
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
  const handleSessionClick = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const handleCharacterClick = (characterId: string) => {
    navigate(`/characters/${characterId}`);
  };

  const handleLocationClick = (locationId: string) => {
    navigate(`/locations/${locationId}`);
  };

  // Handle create new session
  const handleCreateSession = () => {
    navigate('/sessions/create', { state: { campaignId: id } });
  };

  // Handle navigation to world
  const handleWorldClick = () => {
    if (campaign?.worldId) {
      navigate(`/rpg-worlds/${campaign.worldId}`);
    }
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
  if (error || !campaign) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || 'Campaign not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/campaigns')}
          sx={{ mt: 2 }}
        >
          Back to Campaigns
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Unknown'} Campaign`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign.name },
        ]}
        actions={
          <>
            <IconButton
              aria-label="campaign options"
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
        {/* Campaign image and details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ overflow: 'hidden', borderRadius: 2, mb: 3 }}>
            <Box
              component="img"
              src={campaign.imageUrl || '/placeholder-campaign.jpg'}
              alt={campaign.name}
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
              Campaign Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Unknown'}
                color={getStatusColor(campaign.status || '') as any}
                variant="outlined"
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                RPG World
              </Typography>
              <Button
                variant="text"
                color="primary"
                startIcon={<PublicIcon />}
                onClick={handleWorldClick}
                sx={{ pl: 0 }}
              >
                {campaign.worldName || 'View World'}
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Campaign content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="campaign tabs"
                sx={{ px: 2 }}
              >
                <Tab label="Overview" id="campaign-tab-0" aria-controls="campaign-tabpanel-0" />
                <Tab label="Sessions" id="campaign-tab-1" aria-controls="campaign-tabpanel-1" />
                <Tab label="Characters" id="campaign-tab-2" aria-controls="campaign-tabpanel-2" />
                <Tab label="Locations" id="campaign-tab-3" aria-controls="campaign-tabpanel-3" />
                <Tab label="Gallery" id="campaign-tab-4" aria-controls="campaign-tabpanel-4" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {campaign.description}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <EventIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h4">{sessions.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sessions
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4">
                        {formatDuration(sessions.reduce((sum, session) => sum + session.duration, 0))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Time
                      </Typography>
                    </Paper>
                  </Grid>
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
                </Grid>
              </Box>
            </TabPanel>

            {/* Sessions Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Sessions
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateSession}
                >
                  New Session
                </Button>
              </Box>

              {sessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No sessions yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Create your first session in this campaign
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateSession}
                  >
                    Create Session
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {sessions.map((session) => (
                    <Grid item xs={12} key={session.id}>
                      <Card>
                        <CardActionArea onClick={() => handleSessionClick(session.id)}>
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={6}>
                                <Typography variant="h6" component="div">
                                  {session.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(session.date).toLocaleDateString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                                <Typography variant="body2" color="text.secondary">
                                  Duration: {formatDuration(session.duration)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
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
                    No characters in this campaign yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {characters.map((character) => (
                    <Grid item xs={12} sm={6} md={4} key={character.id}>
                      <Card>
                        <CardActionArea onClick={() => handleCharacterClick(character.id)}>
                          <CardContent>
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
                        </CardActionArea>
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
                    No locations in this campaign yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {locations.map((location) => (
                    <Grid item xs={12} sm={6} key={location.id}>
                      <Card>
                        <CardActionArea onClick={() => handleLocationClick(location.id)}>
                          <CardContent>
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
                        </CardActionArea>
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
                onDelete={handleImageDelete}
                onEdit={handleImageEdit}
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
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {campaign.name}? This action cannot be undone.
            All associated sessions, characters, locations, and other data will be permanently deleted.
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

export default CampaignDetailPage;
