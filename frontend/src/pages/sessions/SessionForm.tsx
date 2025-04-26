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
  FormHelperText,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ImageUploader } from '../../components/images';
import { SessionInput } from '../../services/api/session.service';
import RPGWorldService, { RPGWorld } from '../../services/api/rpgWorld.service';
import CampaignService, { Campaign } from '../../services/api/campaign.service';

// Session status options
const SESSION_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface SessionFormProps {
  initialData?: SessionInput;
  onSubmit: (data: SessionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  preselectedCampaignId?: string;
}

const SessionForm: React.FC<SessionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  preselectedCampaignId,
}) => {
  // Form state
  const [formData, setFormData] = useState<SessionInput>(
    initialData || {
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: 180, // 3 hours default
      status: 'planned',
      campaignId: preselectedCampaignId || '',
    }
  );

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading states
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingWorlds, setLoadingWorlds] = useState(false);

  // Data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [worlds, setWorlds] = useState<RPGWorld[]>([]);

  // Fetch campaigns and worlds on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCampaigns(true);
        setLoadingWorlds(true);

        // Fetch campaigns
        const campaignsData = await CampaignService.getCampaigns();
        setCampaigns(campaignsData);

        // Fetch worlds
        const worldsData = await RPGWorldService.getRPGWorlds();
        setWorlds(worldsData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoadingCampaigns(false);
        setLoadingWorlds(false);
      }
    };

    fetchData();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString().split('T')[0],
      }));

      // Clear error for this field
      if (errors.date) {
        setErrors((prev) => ({
          ...prev,
          date: '',
        }));
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    // This would typically call an API to upload the file
    console.log('Uploading image:', file.name);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a local URL for the file
    const imageUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      imageUrl,
    }));
    return imageUrl;
  };

  // Handle image generation
  const handleImageGenerate = async (prompt: string): Promise<string> => {
    // This would typically call an AI image generation service
    console.log('Generating image with prompt:', prompt);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a placeholder URL
    const imageUrl = 'https://via.placeholder.com/800x600?text=Generated+Image';
    setFormData((prev) => ({
      ...prev,
      imageUrl,
    }));
    return imageUrl;
  };

  // Handle image delete
  const handleImageDelete = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    // Validate duration
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
      isValid = false;
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = 'Status is required';
      isValid = false;
    }

    // Validate campaign
    if (!formData.campaignId) {
      newErrors.campaignId = 'Campaign is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Image Upload */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Session Image
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageGenerate={handleImageGenerate}
              onImageDelete={handleImageDelete}
              imageUrl={formData.imageUrl}
              entityType="session"
              entityName={formData.name}
            />
          </Paper>
        </Grid>

        {/* Session Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Session Name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              {/* Campaign */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.campaignId}>
                  <InputLabel id="campaign-select-label">Campaign</InputLabel>
                  <Select
                    labelId="campaign-select-label"
                    id="campaign-select"
                    name="campaignId"
                    value={formData.campaignId}
                    label="Campaign"
                    onChange={handleSelectChange}
                    disabled={loadingCampaigns}
                  >
                    <MenuItem value="">
                      <em>Select a campaign</em>
                    </MenuItem>
                    {loadingCampaigns ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} /> Loading...
                      </MenuItem>
                    ) : (
                      campaigns.map((campaign) => (
                        <MenuItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.campaignId && <FormHelperText>{errors.campaignId}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleSelectChange}
                  >
                    {SESSION_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="date"
                  label="Session Date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.date}
                  helperText={errors.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="duration"
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.duration}
                  helperText={errors.duration}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              {/* Description */}
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
                  helperText={errors.description || 'Describe what happened in this session'}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Form Actions */}
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
          {isSubmitting ? 'Saving...' : initialData ? 'Update Session' : 'Create Session'}
        </Button>
      </Box>
    </form>
  );
};

export default SessionForm;