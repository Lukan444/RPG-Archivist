import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EventFilter: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">Event Filter</Typography>
      <FormControl fullWidth>
        <InputLabel>Filter</InputLabel>
        <Select value="" label="Filter">
          <MenuItem value="">None</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default EventFilter;
