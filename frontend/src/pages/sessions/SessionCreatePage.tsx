import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Alert } from '@mui/material';
import { PageHeader } from '../../components/ui';
import SessionForm from './SessionForm';
import SessionService, { SessionInput } from '../../services/api/session.service';

const SessionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get preselected campaign ID from location state if available
  const preselectedCampaignId = location.state?.campaignId;
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (data: SessionInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create Session
      const createdSession = await SessionService.createSession(data);
      
      // Navigate to the new session's detail page
      navigate(/sessions/);
    } catch (error) {
      console.error('Error creating Session:', error);
      setError('Failed to create Session. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // If we came from a campaign page, go back there
    if (preselectedCampaignId) {
      navigate(/campaigns/);
    } else {
      navigate('/sessions');
    }
  };
  
  return (
    <Container maxWidth=\
lg\>
      <PageHeader
        title=\Create
Session\
        subtitle=\Record
a
new
gaming
session\
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sessions', href: '/sessions' },
          { label: 'Create' },
        ]}
      />
      
      {error && (
        <Alert severity=\error\ sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <SessionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        preselectedCampaignId={preselectedCampaignId}
      />
    </Container>
  );
};

export default SessionCreatePage;
