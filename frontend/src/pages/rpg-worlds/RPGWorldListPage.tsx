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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Campaign as CampaignIcon,
  Public as PublicIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import RPGWorldService, { RPGWorld } from '../../services/api/rpgWorld.service';

const RPGWorldListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for RPG Worlds
  const [worlds, setWorlds] = useState<RPGWorld[]>([]);
  const [filteredWorlds, setFilteredWorlds] = useState<RPGWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for menu and dialog
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Fetch RPG Worlds
  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RPGWorldService.getAllWorlds();
        setWorlds(data);
        setFilteredWorlds(data);
      } catch (error) {
        console.error('Error fetching RPG Worlds:', error);
        setError('Failed to load RPG Worlds. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorlds();
  }, []);
  
  // Filter and sort worlds when search query or sort options change
  useEffect(() => {
    let result = [...worlds];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (world) =>
          world.name.toLowerCase().includes(query) ||
          world.description.toLowerCase().includes(query) ||
          world.genre.toLowerCase().includes(query) ||
          world.system.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'genre':
          comparison = a.genre.localeCompare(b.genre);
          break;
        case 'system':
          comparison = a.system.localeCompare(b.system);
          break;
        case 'campaigns':
          comparison = (a.campaignCount || 0) - (b.campaignCount || 0);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredWorlds(result);
  }, [worlds, searchQuery, sortOption, sortDirection]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
  
  // Handle world menu
  const handleWorldMenuOpen = (event: React.MouseEvent<HTMLElement>, worldId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedWorldId(worldId);
  };
  
  const handleWorldMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedWorldId(null);
  };
  
  // Handle world actions
  const handleViewWorld = (worldId: string) => {
    navigate(/rpg-worlds/);
    handleWorldMenuClose();
  };
  
  const handleEditWorld = (event: React.MouseEvent, worldId: string) => {
    event.stopPropagation();
    navigate(/rpg-worlds//edit);
    handleWorldMenuClose();
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleWorldMenuClose();
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedWorldId(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedWorldId) return;
    
    try {
      await RPGWorldService.deleteWorld(selectedWorldId);
      setWorlds(worlds.filter((world) => world.id !== selectedWorldId));
      setDeleteDialogOpen(false);
      setSelectedWorldId(null);
    } catch (error) {
      console.error('Error deleting RPG World:', error);
      setError('Failed to delete RPG World. Please try again.');
    }
  };
  
  const handleCreateWorld = () => {
    navigate('/rpg-worlds/create');
  };
  
  const handleWorldClick = (worldId: string) => {
    navigate(/rpg-worlds/);
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={skeleton-}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant= rectangular height={140} />
          <CardContent>
            <Skeleton variant=text height={32} width=80% />
            <Skeleton variant=text height={20} width=50% />
            <Skeleton variant=text height={20} width=40% />
            <Skeleton variant=text height={80} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Container maxWidth=lg>
      <PageHeader
        title=RPG Worlds
        subtitle=Manage your RPG worlds and systems
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RPG Worlds' },
        ]}
        action={
          <Button
            variant=contained
            color=primary
            startIcon={<AddIcon />}
            onClick={handleCreateWorld}
          >
            Create World
          </Button>
        }
      />
      
      {/* Search and filter bar */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder=Search worlds...
          variant=outlined
          size=small
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position=start>
                <SearchIcon color=action />
              </InputAdornment>
            ),
          }}
        />
        
        <Tooltip title=Sort worlds>
          <Button
            variant=outlined
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            size=medium
          >
            {sortOption === 'name' ? 'Name' : 
             sortOption === 'genre' ? 'Genre' : 
             sortOption === 'system' ? 'System' : 
             sortOption === 'campaigns' ? 'Campaigns' : 
             sortOption === 'created' ? 'Created' : 
             sortOption === 'updated' ? 'Updated' : 'Sort'}
            {sortDirection === 'asc' ? ' ^' : ' ¡'}
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
            Name {sortOption === 'name' && (sortDirection === 'asc' ? '^' : '¡')}
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortOptionSelect('genre')}
            selected={sortOption === 'genre'}
          >
            Genre {sortOption === 'genre' && (sortDirection === 'asc' ? '^' : '¡')}
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortOptionSelect('system')}
            selected={sortOption === 'system'}
          >
            System {sortOption === 'system' && (sortDirection === 'asc' ? '^' : '¡')}
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortOptionSelect('campaigns')}
            selected={sortOption === 'campaigns'}
          >
            Campaigns {sortOption === 'campaigns' && (sortDirection === 'asc' ? '^' : '¡')}
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => handleSortOptionSelect('created')}
            selected={sortOption === 'created'}
          >
            Created Date {sortOption === 'created' && (sortDirection === 'asc' ? '^' : '¡')}
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortOptionSelect('updated')}
            selected={sortOption === 'updated'}
          >
            Updated Date {sortOption === 'updated' && (sortDirection === 'asc' ? '^' : '¡')}
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity=error sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading && filteredWorlds.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PublicIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant=h6 gutterBottom>
            {searchQuery ? 'No worlds match your search' : 'No RPG Worlds yet'}
          </Typography>
          <Typography variant=body1 color=text.secondary paragraph>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first RPG world to get started'}
          </Typography>
          {!searchQuery && (
            <Button
              variant=contained
              color=primary
              startIcon={<AddIcon />}
              onClick={handleCreateWorld}
              sx={{ mt: 2 }}
            >
              Create World
            </Button>
          )}
        </Box>
      )}
      
      {/* World grid */}
      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : (
          filteredWorlds.map((world) => (
            <Grid item xs={12} sm={6} md={4} key={world.id}>
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
                onClick={() => handleWorldClick(world.id)}
              >
                <CardMedia
                  component=img
                  height=140
                  image={world.imageUrl || '/placeholder-world.jpg'}
                  alt={world.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant=h6 component=div gutterBottom>
                      {world.name}
                    </Typography>
                    <IconButton
                      size=small
                      onClick={(e) => handleWorldMenuOpen(e, world.id)}
                      aria-label=world options
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={world.genre} 
                      size=small 
                      color=primary 
                      variant=outlined 
                    />
                    <Chip 
                      label={world.system} 
                      size=small 
                      color=secondary 
                      variant=outlined 
                    />
                  </Box>
                  
                  <Typography 
                    variant=body2 
                    color=text.secondary
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {world.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <CampaignIcon fontSize=small color=action sx={{ mr: 0.5 }} />
                    <Typography variant=body2 color=text.secondary>
                      {world.campaignCount || 0} {world.campaignCount === 1 ? 'Campaign' : 'Campaigns'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* World options menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleWorldMenuClose}
      >
        <MenuItem onClick={() => selectedWorldId && handleViewWorld(selectedWorldId)}>
          <ListItemIcon>
            <VisibilityIcon fontSize=small />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem onClick={(e) => selectedWorldId && handleEditWorld(e, selectedWorldId)}>
          <ListItemIcon>
            <EditIcon fontSize=small />
          </ListItemIcon>
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize=small color=error />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete RPG World</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this RPG World? This action cannot be undone.
            All associated campaigns and data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color=error variant=contained>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RPGWorldListPage;
