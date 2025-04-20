import React, { useState, useEffect } from \ react\;
import {
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Autocomplete,
} from \@mui/material\;
import { ImageUpload } from \../../components/images\;
import { CharacterInput } from \../../services/api/character.service\;
import RPGWorldService, { RPGWorld } from \../../services/api/rpgWorld.service\;
import CampaignService, { Campaign } from \../../services/api/campaign.service\;

// Character type options
const characterTypeOptions = [
  { value: \PC\, label: \Player Character\ },
  { value: \NPC\, label: \Non-Player Character\ },
];

// Common race options (can be expanded)
const commonRaceOptions = [
  \Human\,
  \Elf\,
  \Dwarf\,
  \Halfling\,
  \Gnome\,
  \Half-Elf\,
  \Half-Orc\,
  \Tiefling\,
  \Dragonborn\,
  \Other\,
];

// Common class options (can be expanded)
const commonClassOptions = [
  \Barbarian\,
  \Bard\,
  \Cleric\,
  \Druid\,
  \Fighter\,
  \Monk\,
  \Paladin\,
  \Ranger\,
  \Rogue\,
  \Sorcerer\,
  \Warlock\,
  \Wizard\,
  \Artificer\,
  \Blood Hunter\,
  \Other\,
];

// Character form props
interface CharacterFormProps {
  initialData?: CharacterInput;
  onSubmit: (data: CharacterInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  preselectedWorldId?: string;
  preselectedCampaignId?: string;
  preselectedLocationId?: string;
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  preselectedWorldId,
  preselectedCampaignId,
  preselectedLocationId,
}) => {
  // Form state
  const [formData, setFormData] = useState<CharacterInput>({
    name: \\,
    description: \\,
    characterType: \NPC\,
    race: \\,
    class: \\,
    worldId: \\,
    campaignId: undefined,
    locationId: undefined,
    imageUrl: undefined,
  });
  
  // Data state
  const [worlds, setWorlds] = useState<RPGWorld[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  // Loading state
  const [loadingWorlds, setLoadingWorlds] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch RPG Worlds
  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        setLoadingWorlds(true);
        const data = await RPGWorldService.getAllWorlds();
        setWorlds(data);
      } catch (error) {
        console.error(\Error fetching RPG Worlds:\, error);
      } finally {
        setLoadingWorlds(false);
      }
    };
    
    fetchWorlds();
  }, []);
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Set preselected values if provided
      const newFormData = { ...formData };
      
      if (preselectedWorldId) {
        newFormData.worldId = preselectedWorldId;
      }
      
      if (preselectedCampaignId) {
        newFormData.campaignId = preselectedCampaignId;
      }
      
      if (preselectedLocationId) {
        newFormData.locationId = preselectedLocationId;
      }
      
      setFormData(newFormData);
    }
  }, [initialData, preselectedWorldId, preselectedCampaignId, preselectedLocationId]);
  
  // Fetch campaigns when world changes
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!formData.worldId) {
        setCampaigns([]);
        return;
      }
      
      try {
        setLoadingCampaigns(true);
        const data = await CampaignService.getCampaignsByWorldId(formData.worldId);
        setCampaigns(data);
      } catch (error) {
        console.error(\Error fetching Campaigns:\, error);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    
    fetchCampaigns();
  }, [formData.worldId]);
  
  // Fetch locations when world changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.worldId) {
        setLocations([]);
        return;
      }
      
      try {
        setLoadingLocations(true);
        // In a real implementation, this would call LocationService.getLocationsByWorldId
        // For now, we'll just use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setLocations([
          { id: \1\, name: \Rivendell\ },
          { id: \2\, name: \Mordor\ },
          { id: \3\, name: \Minas Tirith\ },
        ]);
      } catch (error) {
        console.error(\Error fetching Locations:\, error);
      } finally {
        setLoadingLocations(false);
      }
    };
    
    fetchLocations();
  }, [formData.worldId]);
  
  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error for this field
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: \\,
        });
      }
    }
  };
  
  // Handle race change
  const handleRaceChange = (event: React.ChangeEvent<{}>, value: string | null) => {
    setFormData({
      ...formData,
      race: value || \\,
    });
    
    // Clear error for race field
    if (errors.race) {
      setErrors({
        ...errors,
        race: \\,
      });
    }
  };
  
  // Handle class change
  const handleClassChange = (event: React.ChangeEvent<{}>, value: string | null) => {
    setFormData({
      ...formData,
      class: value || \\,
    });
    
    // Clear error for class field
    if (errors.class) {
      setErrors({
        ...errors,
        class: \\,
      });
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    // In a real implementation, this would upload the file to a server
    // For now, we'll just create a local URL
    const imageUrl = URL.createObjectURL(file);
    setFormData({
      ...formData,
      imageUrl,
    });
    return imageUrl;
  };
  
  // Handle image generation
  const handleImageGenerate = async (prompt: string): Promise<string> => {
    // In a real implementation, this would call an AI image generation API
    // For now, we'll just return a placeholder image
    const imageUrl = \https://via.placeholder.com/800x600?text=Generated+Image\;
    setFormData({
      ...formData,
      imageUrl,
    });
    return imageUrl;
  };
  
  // Handle image delete
  const handleImageDelete = () => {
    setFormData({
      ...formData,
      imageUrl: undefined,
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = \Name is required\;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = \Description is required\;
    }
    
    if (!formData.characterType) {
      newErrors.characterType = \Character type is required\;
    }
    
    if (!formData.race.trim()) {
      newErrors.race = \Race is required\;
    }
    
    if (!formData.class.trim()) {
      newErrors.class = \Class is required\;
    }
    
    if (!formData.worldId) {
      newErrors.worldId = \RPG World is required\;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Left column - Image upload */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant=\h6\ gutterBottom>
              Character Image
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageGenerate={handleImageGenerate}
              onImageDelete={handleImageDelete}
              imageUrl={formData.imageUrl}
              entityType=\character\
              entityName={formData.name}
            />
          </Paper>
        </Grid>
        
        {/* Right column - Form fields */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant=\h6\ gutterBottom>
              Character Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name=\name\
                  label=\Character Name\
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.characterType}>
                  <InputLabel id=\character-type-select-label\>Character Type</InputLabel>
                  <Select
                    labelId=\character-type-select-label\
                    id=\character-type-select\
                    name=\characterType\
                    value={formData.characterType}
                    label=\Character Type\
                    onChange={handleChange}
                  >
                    {characterTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.characterType && <FormHelperText>{errors.characterType}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.worldId}>
                  <InputLabel id=\world-select-label\>RPG World</InputLabel>
                  <Select
                    labelId=\world-select-label\
                    id=\world-select\
                    name=\worldId\
                    value={formData.worldId}
                    label=\RPG World\
                    onChange={handleChange}
                    disabled={loadingWorlds}
                  >
                    {loadingWorlds ? (
                      <MenuItem value=\\>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading worlds...
                        </Box>
                      </MenuItem>
                    ) : (
                      worlds.map((world) => (
                        <MenuItem key={world.id} value={world.id}>
                          {world.name} ({world.system})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.worldId && <FormHelperText>{errors.worldId}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  id=\race-autocomplete\
                  options={commonRaceOptions}
                  freeSolo
                  value={formData.race}
                  onChange={handleRaceChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label=\Race\
                      name=\race\
                      required
                      error={!!errors.race}
                      helperText={errors.race}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          race: e.target.value,
                        });
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  id=\class-autocomplete\
                  options={commonClassOptions}
                  freeSolo
                  value={formData.class}
                  onChange={handleClassChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label=\Class\
                      name=\class\
                      required
                      error={!!errors.class}
                      helperText={errors.class}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          class: e.target.value,
                        });
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id=\campaign-select-label\>Campaign</InputLabel>
                  <Select
                    labelId=\campaign-select-label\
                    id=\campaign-select\
                    name=\campaignId\
                    value={formData.campaignId || \\}
                    label=\Campaign\
                    onChange={handleChange}
                    disabled={loadingCampaigns || !formData.worldId}
                  >
                    <MenuItem value=\\>
                      <em>None</em>
                    </MenuItem>
                    {loadingCampaigns ? (
                      <MenuItem value=\\ disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading campaigns...
                        </Box>
                      </MenuItem>
                    ) : (
                      campaigns.map((campaign) => (
                        <MenuItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>Associate with a specific campaign</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id=\location-select-label\>Location</InputLabel>
                  <Select
                    labelId=\location-select-label\
                    id=\location-select\
                    name=\locationId\
                    value={formData.locationId || \\}
                    label=\Location\
                    onChange={handleChange}
                    disabled={loadingLocations || !formData.worldId}
                  >
                    <MenuItem value=\\>
                      <em>None</em>
                    </MenuItem>
                    {loadingLocations ? (
                      <MenuItem value=\\ disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading locations...
                        </Box>
                      </MenuItem>
                    ) : (
                      locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>Character's current location</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name=\description\
                  label=\Description\
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  error={!!errors.description}
                  helperText={errors.description || \Describe the character, their personality, appearance, and background\}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant=\outlined\
                color=\inherit\
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type=\submit\
                variant=\contained\
                color=\primary\
                disabled={isSubmitting}
              >
                {isSubmitting ? \Saving...\ : initialData ? \Update Character\ : \Create Character\}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
};

export default CharacterForm;
