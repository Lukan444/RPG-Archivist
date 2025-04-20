import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Skeleton, Box, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import CampaignForm from './CampaignForm';
import CampaignService, { CampaignInput } from '../../services/api/campaign.service';

const CampaignEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for Campaign
  const [campaignData, setCampaignData] = useState<CampaignInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch Campaign
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await CampaignService.getCampaignById(id);
        
        // Convert to form data format
        setCampaignData({
          name: data.name,
          description: data.description,
          status: data.status,
          worldId: data.worldId,
          imageUrl: data.imageUrl,
        });
      } catch (error) {
        console.error('Error fetching Campaign:', error);
        setError('Failed to load Campaign. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id]);
  
  // Handle form submission
  const handleSubmit = async (data: CampaignInput) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update Campaign
      await CampaignService.updateCampaign(id, data);
      
      // Navigate back to the campaign's detail page
      navigate(/campaigns/);
    } catch (error) {
      console.error('Error updating Campaign:', error);
      setError('Failed to update Campaign. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (id) {
      navigate(/campaigns/);
    } else {
      navigate('/campaigns');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth=\
lg\>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant=\text\ height={40} width=\50%\ />
          <Skeleton variant=\text\ height={24} width=\30%\ />
        </Box>
        
        <Paper sx={{ p: 3 }}>
          <Skeleton variant=\text\ height={32} />
          <Skeleton variant=\text\ height={32} />
          <Skeleton variant=\text\ height={32} />
          <Skeleton variant=\rectangular\ height={150} sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }
  
  // Render error state
  if (error && !campaignData) {
    return (
      <Container maxWidth=\lg\>
        <PageHeader
          title=\Edit
Campaign\
          subtitle=\Update
your
campaign
details\
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Campaigns', href: '/campaigns' },
            { label: 'Edit' },
          ]}
        />
        
        <Alert severity=\error\ sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth=\lg\>
      <PageHeader
        title={Edit }
        subtitle=\Update
your
campaign
details\
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaignData?.name || 'Campaign', href: /campaigns/ },
          { label: 'Edit' },
        ]}
      />
      
      {error && (
        <Alert severity=\error\ sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {campaignData && (
        <CampaignForm
          initialData={campaignData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
};

export default CampaignEditPage;
