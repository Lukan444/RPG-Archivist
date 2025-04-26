import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { PageHeader } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

const EventListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Events"
        subtitle="Manage your campaign events"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events' },
        ]}
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/events/create')}
          >
            Create Event
          </Button>
        }
      />

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1">
          The Events feature is currently under development. Check back later!
        </Typography>
      </Box>
    </Container>
  );
};

export default EventListPage;