import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import PageHeader from '../../components/ui/PageHeader';

const TimelinePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Timeline"
        subtitle="View and manage your campaign timeline"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Timeline' },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Campaign Timeline
        </Typography>
        <Typography variant="body1">
          Timeline feature will be implemented soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TimelinePage;
