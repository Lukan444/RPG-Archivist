import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

interface ExampleFormProps {
  onSubmit?: (data: any) => void;
}

const ExampleForm: React.FC<ExampleFormProps> = ({ onSubmit }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit({ name: 'Example Form Data' });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Example Form
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Example Field"
          placeholder="Enter some text"
          margin="normal"
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ExampleForm;
