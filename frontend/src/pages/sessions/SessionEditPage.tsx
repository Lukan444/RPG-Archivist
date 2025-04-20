import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Skeleton, Box, Paper } from '@mui/material';
import { PageHeader } from '../../components/ui';
import SessionForm from './SessionForm';
import SessionService, { SessionInput } from '../../services/api/session.service';

const SessionEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for Session
  const [sessionData, setSessionData] = useState<SessionInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch Session
  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await SessionService.getSessionById(id);
        
        // Convert to form data format
        setSessionData({
          name: data.name,
          description: data.description,
          date: data.date,
          duration: data.duration,
          campaignId: data.campaignId,
          imageUrl: data.imageUrl,
        });
      } catch (error) {
        console.error('Error fetching Session:', error);
        setError('Failed to load Session. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [id]);
  
  // Handle form submission
  const handleSubmit = async (data: SessionInput) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update Session
      await SessionService.updateSession(id, data);
      
      // Navigate back to the session's detail page
      navigate(/sessions/);
    } catch (error) {
      console.error('Error updating Session:', error);
      setError('Failed to update Session. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (id) {
      navigate(/sessions/);
    } else {
      navigate('/sessions');
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
  if (error && !sessionData) {
    return (
      <Container maxWidth=\lg\>
        <PageHeader
          title=\Edit
Session\
          subtitle=\Update
your
session
details\
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Sessions', href: '/sessions' },
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
session
details\
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sessions', href: '/sessions' },
          { label: sessionData?.name || 'Session', href: /sessions/ },
          { label: 'Edit' },
        ]}
      />
      
      {error && (
        <Alert severity=\error\ sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {sessionData && (
        <SessionForm
          initialData={sessionData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
};

export default SessionEditPage;
