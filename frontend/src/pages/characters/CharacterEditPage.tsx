import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Skeleton, Box, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import CharacterForm from './CharacterForm';
import CharacterService, { CharacterInput } from '../../services/api/character.service';

const CharacterEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for Character
  const [characterData, setCharacterData] = useState<CharacterInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Character
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await CharacterService.getCharacterById(id);

        // Convert to form data format
        setCharacterData({
          name: data.name,
          description: data.description,
          characterType: data.characterType,
          race: data.race,
          class: data.class,
          worldId: data.worldId,
          campaignId: data.campaignId,
          locationId: data.locationId,
          imageUrl: data.imageUrl,
        });
      } catch (error) {
        console.error('Error fetching Character:', error);
        setError('Failed to load Character. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (data: CharacterInput) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Update Character
      await CharacterService.updateCharacter(id, data);

      // Navigate back to the character's detail page
      navigate(`/characters/${id}`);
    } catch (error) {
      console.error('Error updating Character:', error);
      setError('Failed to update Character. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (id) {
      navigate(`/characters/${id}`);
    } else {
      navigate('/characters');
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
  if (error && !characterData) {
    return (
      <Container maxWidth="lg">
        <PageHeader
          title="Edit Character"
          subtitle="Update your character details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Characters', href: '/characters' },
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
        title={`Edit ${characterData?.name || 'Character'}`}
        subtitle="Update your character details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Characters', href: '/characters' },
          { label: characterData?.name || 'Character', href: `/characters/${id}` },
          { label: 'Edit' },
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {characterData && (
        <CharacterForm
          initialData={characterData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
};

export default CharacterEditPage;
