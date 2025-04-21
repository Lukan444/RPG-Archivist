import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

const LocationListPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Locations"
        actions={
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/locations/create"
          >
            Create Location
          </Button>
        }
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Location list will be implemented soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default LocationListPage;
