import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Tabs, Tab, Button, Snackbar, Alert, Divider } from '@mui/material';
import { MicOutlined, AudioFileOutlined, ArrowBackOutlined } from '@mui/icons-material';
import { AudioRecorder, AudioRecordingsList } from '../components/audio';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recordings-tabpanel-${index}`}
      aria-labelledby={`recordings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SessionRecordingsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        if (!sessionId) return;

        const response = await fetch(`/api/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }

        const data = await response.json();

        if (data.success) {
          setSessionName(data.data.name);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch session details');
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        setError('Failed to load session details. Please try again.');
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle recording complete
  const handleRecordingComplete = (recordingId: string) => {
    setSuccess('Recording saved successfully');
    setTabValue(1); // Switch to recordings list tab
  };

  // Handle error
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Handle close error
  const handleCloseError = () => {
    setError(null);
  };

  // Handle close success
  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  // Handle back button
  const handleBack = () => {
    navigate(`/sessions/${sessionId}`);
  };

  if (!sessionId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Session not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>

        <Typography variant="h4" component="h1">
          {sessionName ? `${sessionName} - Recordings` : 'Session Recordings'}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="recordings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<MicOutlined />}
            label="Record"
            id="recordings-tab-0"
            aria-controls="recordings-tabpanel-0"
          />
          <Tab
            icon={<AudioFileOutlined />}
            label="Recordings"
            id="recordings-tab-1"
            aria-controls="recordings-tabpanel-1"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <AudioRecorder
            sessionId={sessionId}
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AudioRecordingsList
            sessionId={sessionId}
            onError={handleError}
            onAnalyzeClick={(transcriptionId, sessionId) => {
              navigate(`/sessions/${sessionId}/analysis/${transcriptionId}`);
            }}
          />
        </TabPanel>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SessionRecordingsPage;
