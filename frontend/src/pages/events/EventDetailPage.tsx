import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import { useNavigate, useParams } from 'react-router-dom';

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Event Details"
        subtitle="View event information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events', href: '/events' },
          { label: 'Event Details' },
        ]}
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/events/${id}/edit`)}
          >
            Edit Event
          </Button>
        }
      />

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Coming Soon
          </Typography>
          <Typography variant="body1">
            The Events feature is currently under development. Check back later!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetailPage;