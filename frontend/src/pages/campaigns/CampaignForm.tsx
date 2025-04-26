import React, { useState, useEffect } from 'react';
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
  SelectChangeEvent,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { adaptSelectChangeHandlerForInput } from '../../utils/eventHandlers';
import { ImageUploader } from '../../components/images';
import { CampaignInput } from '../../services/api/campaign.service';
import RPGWorldService, { RPGWorld } from '../../services/api/rpgWorld.service';

// Campaign status options
const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

// Campaign form props
interface CampaignFormProps {
  initialData?: CampaignInput;
  onSubmit: (data: CampaignInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  preselectedWorldId?: string;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  preselectedWorldId,
}) => {
  // Form state
  const [formData, setFormData] = useState<CampaignInput>({
    name: '',
    description: '',
    status: 'planned',
    worldId: '',
    imageUrl: undefined,
  });

  // RPG Worlds state
  const [worlds, setWorlds] = useState<RPGWorld[]>([]);
  const [loadingWorlds, setLoadingWorlds] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch RPG Worlds
  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        setLoadingWorlds(true);
        const data = await RPGWorldService.getRPGWorlds();
        setWorlds(data);
      } catch (error) {
        console.error('Error fetching RPG Worlds:', error);
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
    } else if (preselectedWorldId) {
      setFormData(prevData => ({
        ...prevData,
        worldId: preselectedWorldId,
      }));
    }
  }, [initialData, preselectedWorldId]);

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
          [name]: '',
        });
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (imageUrl: string): void => {
    // Update the form data with the image URL
    setFormData({
      ...formData,
      imageUrl,
    });
  };

  // Handle image generation
  const handleImageGenerate = async (prompt: string): Promise<string> => {
    // In a real implementation, this would call an AI image generation API
    // For now, we'll just return a placeholder image
    const imageUrl = 'https://via.placeholder.com/800x600?text=Generated+Image';
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
      newErrors.name = 'Name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.worldId) {
      newErrors.worldId = 'RPG World is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
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
            <Typography variant="h6" gutterBottom>
              Campaign Image
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageGenerate={handleImageGenerate}
              onImageDelete={handleImageDelete}
              imageUrl={formData.imageUrl}
              entityType="campaign"
              entityName={formData.name}
            />
          </Paper>
        </Grid>

        {/* Right column - Form fields */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Campaign Name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.worldId}>
                  <InputLabel id="world-select-label">RPG World</InputLabel>
                  <Select
                    labelId="world-select-label"
                    id="world-select"
                    name="worldId"
                    value={formData.worldId}
                    label="RPG World"
                    onChange={adaptSelectChangeHandlerForInput(handleChange)}
                    disabled={loadingWorlds}
                  >
                    {loadingWorlds ? (
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading worlds...
                        </Box>
                      </MenuItem>
                    ) : (
                      worlds.map((world) => (
                        <MenuItem key={world.id} value={world.id}>
                          {world.name} {world.gameSystem ? `(${world.gameSystem})` : ''}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.worldId && <FormHelperText>{errors.worldId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.status}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={adaptSelectChangeHandlerForInput(handleChange)}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  error={!!errors.description}
                  helperText={errors.description || 'Describe your campaign, its premise, and key themes'}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
};

export default CampaignForm;
