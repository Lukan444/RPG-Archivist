import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const EventRelationships: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">Event Relationships</Typography>
      <List>
        <ListItem>
          <ListItemText primary="No relationships found" secondary="This component is under development" />
        </ListItem>
      </List>
    </Box>
  );
};

export default EventRelationships;
