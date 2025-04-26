import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Create Event"
        subtitle="Add a new event to your campaign"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events', href: '/events' },
          { label: 'Create' },
        ]}
      />

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Coming Soon
          </Typography>
          <Typography variant="body1">
            The Events feature is currently under development. Check back later!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/events')}
            sx={{ mt: 3 }}
          >
            Back to Events
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventCreatePage;