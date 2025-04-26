import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Skeleton, Box, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import RPGWorldForm from './RPGWorldForm';
import RPGWorldService, { RPGWorldInput } from '../../services/api/rpgWorld.service';

const RPGWorldEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for RPG World
  const [worldData, setWorldData] = useState<RPGWorldInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch RPG World
  useEffect(() => {
    const fetchWorld = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await RPGWorldService.getRPGWorld(id);

        // Convert to form data format
        setWorldData({
          name: data.name,
          description: data.description,
          genre: data.genre,
          system: data.system,
          imageUrl: data.imageUrl,
        });
      } catch (error) {
        console.error('Error fetching RPG World:', error);
        setError('Failed to load RPG World. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorld();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (data: RPGWorldInput) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Update RPG World
      await RPGWorldService.updateRPGWorld(id, data);

      // Navigate back to the world's detail page
      navigate(`/rpg-worlds/${id}`);
    } catch (error) {
      console.error('Error updating RPG World:', error);
      setError('Failed to update RPG World. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (id) {
      navigate(`/rpg-worlds/${id}`);
    } else {
      navigate('/rpg-worlds');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" height={40} width="50%" />
          <Skeleton variant="text" height={24} width="30%" />
        </Box>

        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={32} />
          <Skeleton variant="rectangular" height={150} sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (error && !worldData) {
    return (
      <Container maxWidth="lg">
        <PageHeader
          title="Edit RPG World"
          subtitle="Update your world details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'RPG Worlds', href: '/rpg-worlds' },
            { label: 'Edit' },
          ]}
        />

        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={`Edit ${worldData?.name || 'RPG World'}`}
        subtitle="Update your world details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RPG Worlds', href: '/rpg-worlds' },
          { label: worldData?.name || 'World', href: `/rpg-worlds/${id}` },
          { label: 'Edit' },
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {worldData && (
        <RPGWorldForm
          initialData={worldData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
};

export default RPGWorldEditPage;
