import React from 'react';
import { Typography, Box, Button, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

const LocationCreatePage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Create Location"
        actions={
          <Button
            variant="outlined"
            component={Link}
            to="/locations"
          >
            Cancel
          </Button>
        }
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1">
              Location creation form will be implemented soon.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              disabled
            >
              Save Location
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LocationCreatePage;
