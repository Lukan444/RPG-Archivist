import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import { useNavigate, useParams } from 'react-router-dom';

const EventEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Edit Event"
        subtitle="Update event details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events', href: '/events' },
          { label: 'Event', href: `/events/${id}` },
          { label: 'Edit' },
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
            onClick={() => navigate(`/events/${id}`)}
            sx={{ mt: 3 }}
          >
            Back to Event
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventEditPage;