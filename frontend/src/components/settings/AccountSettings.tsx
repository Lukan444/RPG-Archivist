import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  IconButton,
  Paper
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AccountSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Account Settings
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <Avatar
          sx={{ width: 80, height: 80, mr: 2 }}
          src={user?.avatarUrl || undefined}
        >
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">Profile Picture</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            JPG, PNG or GIF. Max size 2MB.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
            disabled
          >
            Upload
            <input type="file" hidden disabled />
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Username"
          value={user?.username || ''}
          margin="normal"
          disabled
        />
        <TextField
          fullWidth
          label="Email"
          value={user?.email || ''}
          margin="normal"
          disabled
        />
        <TextField
          fullWidth
          label="Current Password"
          type="password"
          margin="normal"
          disabled
          helperText="This feature is under development"
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          margin="normal"
          disabled
          helperText="This feature is under development"
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          margin="normal"
          disabled
          helperText="This feature is under development"
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AccountSettings;
