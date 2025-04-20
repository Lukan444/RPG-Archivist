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
} from '@mui/material';
import { ImageUpload } from '../../components/images';
import { RPGWorldInput } from '../../services/api/rpgWorld.service';

// Genre options
const genreOptions = [
  'Fantasy',
  'Science Fiction',
  'Horror',
  'Post-Apocalyptic',
  'Cyberpunk',
  'Steampunk',
  'Western',
  'Modern',
  'Historical',
  'Superhero',
  'Other',
];

// System options
const systemOptions = [
  'D&D 5e',
  'Pathfinder',
  'Call of Cthulhu',
  'Savage Worlds',
  'GURPS',
  'Fate',
  'World of Darkness',
  'Shadowrun',
  'Starfinder',
  'Blades in the Dark',
  'Powered by the Apocalypse',
  'Cypher System',
  'Other',
];

// RPG World form props
interface RPGWorldFormProps {
  initialData?: RPGWorldInput;
  onSubmit: (data: RPGWorldInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const RPGWorldForm: React.FC<RPGWorldFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // Form state
  const [formData, setFormData] = useState<RPGWorldInput>({
    name: '',
    description: '',
    genre: 'Fantasy',
    system: 'D&D 5e',
    imageUrl: undefined,
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.genre) {
      newErrors.genre = 'Genre is required';
    }
    
    if (!formData.system) {
      newErrors.system = 'System is required';
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
            <Typography variant=\
h6\ gutterBottom>
              World Image
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageGenerate={handleImageGenerate}
              onImageDelete={handleImageDelete}
              imageUrl={formData.imageUrl}
              entityType=\world\
              entityName={formData.name}
            />
          </Paper>
        </Grid>
        
        {/* Right column - Form fields */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant=\h6\ gutterBottom>
              World Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name=\name\
                  label=\World
Name\
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name=\genre\
                  label=\Genre\
                  value={formData.genre}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.genre}
                  helperText={errors.genre}
                >
                  {genreOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name=\system\
                  label=\System\
                  value={formData.system}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.system}
                  helperText={errors.system}
                >
                  {systemOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
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
                  helperText={errors.description || 'Describe your RPG world, its history, and key features'}
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
                {isSubmitting ? 'Saving...' : initialData ? 'Update World' : 'Create World'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
};

export default RPGWorldForm;
