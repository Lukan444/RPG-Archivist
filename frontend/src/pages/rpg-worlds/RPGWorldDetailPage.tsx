import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Campaign as CampaignIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

import RPGWorldService from '../../services/api/rpgWorld.service';
import CampaignService from '../../services/api/campaign.service';
import { PageHeader } from '../../components/ui';
import { Campaign } from '../../services/api/campaign.service';

const RPGWorldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [world, setWorld] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Fetch world data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch RPG world details
        const worldData = await RPGWorldService.getRPGWorld(id);
        setWorld(worldData);

        // Fetch campaigns for this world
        const campaignsData = await CampaignService.getCampaignsByWorldId(id);
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching RPG world details:', error);
        setError('Failed to load RPG world details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle edit
  const handleEdit = () => {
    handleMenuClose();
    navigate(`/rpg-worlds/${id}/edit`);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await RPGWorldService.deleteRPGWorld(id);
      navigate('/rpg-worlds');
    } catch (error) {
      console.error('Error deleting RPG world:', error);
      setError('Failed to delete RPG world. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  // Handle campaign click
  const handleCampaignClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Handle create campaign
  const handleCreateCampaign = () => {
    navigate(`/campaigns/create?worldId=${id}`);
  };

  // Handle back
  const handleBack = () => {
    navigate('/rpg-worlds');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleBack}>
              Back to RPG Worlds
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!world) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">RPG World not found.</Alert>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleBack}>
              Back to RPG Worlds
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={world.name}
        subtitle="RPG World Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RPG Worlds', href: '/rpg-worlds' },
          { label: world.name },
        ]}
        actions={<Button
          startIcon={<MoreVertIcon />}
          onClick={handleMenuOpen}
        >
          More
        </Button>}
      />

      {/* World details */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          {/* World image */}
          {world.imageUrl && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={world.imageUrl}
                  alt={world.name}
                />
              </Card>
            </Grid>
          )}

          {/* World info */}
          <Grid item xs={12} md={world.imageUrl ? 8 : 12}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {world.name}
              </Typography>

              {/* Tags */}
              <Box sx={{ mb: 2 }}>
                {world.genre && (
                  <Chip
                    label={`Genre: ${world.genre}`}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {world.system && (
                  <Chip
                    label={`System: ${world.system}`}
                    color="secondary"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>

              {/* Description */}
              <Typography variant="body1" paragraph>
                {world.description}
              </Typography>

              {/* Metadata */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(world.createdAt).toLocaleDateString()}
                </Typography>
                {world.updatedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(world.updatedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Campaigns section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Campaigns</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </Button>
        </Box>

        {campaigns.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No campaigns yet. Create your first campaign for this world!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {campaigns.map((campaign) => (
              <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                  }}
                  onClick={() => handleCampaignClick(campaign.id)}
                >
                  {campaign.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={campaign.imageUrl}
                      alt={campaign.name}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {campaign.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {campaign.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${campaign.sessionCount || 0} sessions`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete RPG World</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{world.name}"? This action cannot be undone.
            {campaigns.length > 0 && (
              <>
                <br /><br />
                <strong>Warning:</strong> This world has {campaigns.length} campaign(s) associated with it.
                Deleting this world may affect these campaigns.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RPGWorldDetailPage;