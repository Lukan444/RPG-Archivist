import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert } from '@mui/material';
import { PageHeader } from '../../components/ui';
import RPGWorldForm from './RPGWorldForm';
import RPGWorldService, { RPGWorldInput } from '../../services/api/rpgWorld.service';

const RPGWorldCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (data: RPGWorldInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create RPG World
      const createdWorld = await RPGWorldService.createRPGWorld(data);

      // Navigate to the new world's detail page
      navigate(`/rpg-worlds/${createdWorld.id}`);
    } catch (error) {
      console.error('Error creating RPG World:', error);
      setError('Failed to create RPG World. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/rpg-worlds');
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Create RPG World"
        subtitle="Define a new world for your campaigns"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RPG Worlds', href: '/rpg-worlds' },
          { label: 'Create' },
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <RPGWorldForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
};

export default RPGWorldCreatePage;
