import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Alert } from '@mui/material';
import { PageHeader } from '../../components/ui';
import CampaignForm from './CampaignForm';
import CampaignService, { CampaignInput } from '../../services/api/campaign.service';

const CampaignCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get preselected world ID from location state if available
  const preselectedWorldId = location.state?.worldId;

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (data: CampaignInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create Campaign
      const createdCampaign = await CampaignService.createCampaign(data);

      // Navigate to the new campaign's detail page
      navigate(`/campaigns/${createdCampaign.id}`);
    } catch (error) {
      console.error('Error creating Campaign:', error);
      setError('Failed to create Campaign. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // If we came from a world page, go back there
    if (preselectedWorldId) {
      navigate(`/rpg-worlds/${preselectedWorldId}`);
    } else {
      navigate('/campaigns');
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Create Campaign"
        subtitle="Start a new adventure in your RPG world"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Create' },
        ]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CampaignForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        preselectedWorldId={preselectedWorldId}
      />
    </Container>
  );
};

export default CampaignCreatePage;
