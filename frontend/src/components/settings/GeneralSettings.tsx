import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Paper
} from '@mui/material';

const GeneralSettings: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        General Settings
      </Typography>
      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Default Campaign"
          placeholder="Select default campaign"
          margin="normal"
          disabled
          helperText="This feature is under development"
        />
        <TextField
          fullWidth
          label="Default World"
          placeholder="Select default world"
          margin="normal"
          disabled
          helperText="This feature is under development"
        />
        <FormControl fullWidth margin="normal">
          <FormControlLabel
            control={<Switch disabled />}
            label="Auto-save drafts"
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <FormControlLabel
            control={<Switch disabled />}
            label="Show welcome screen on startup"
          />
        </FormControl>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default GeneralSettings;
