import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/ui/PageHeader';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call an API to update the user profile
    setSuccess('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <Box>
      <PageHeader
        title="Profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' },
        ]}
        actions={
          isEditing ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Save
              </Button>
            </Box>
          ) : (
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )
        }
      />

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={user?.avatar || ''}
              alt={user?.name || 'User'}
              sx={{ width: 150, height: 150, mb: 2 }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            {!isEditing && (
              <Typography variant="h5" gutterBottom>
                {user?.name || 'User'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Last Login
            </Typography>
            <Typography variant="body1">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
