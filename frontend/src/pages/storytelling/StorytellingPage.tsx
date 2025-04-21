import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import StorytellingInterface from '../../components/storytelling/StorytellingInterface';
import CampaignService from '../../services/api/campaign.service';
import SessionService from '../../services/api/session.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`storytelling-tabpanel-${index}`}
      aria-labelledby={`storytelling-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const StorytellingPage: React.FC = () => {
  const { campaignId, sessionId } = useParams<{
    campaignId?: string;
    sessionId?: string;
  }>();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>(campaignId || '');
  const [selectedSession, setSelectedSession] = useState<string>(sessionId || '');
  const [contextName, setContextName] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchSessions(selectedCampaign);
    } else {
      setSessions([]);
      setSelectedSession('');
    }
  }, [selectedCampaign]);

  useEffect(() => {
    updateContextName();
  }, [selectedCampaign, selectedSession, campaigns, sessions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaigns
      const campaignsData = await CampaignService.getCampaigns();
      setCampaigns(campaignsData.map(campaign => ({
        id: campaign.id,
        name: campaign.name
      })));

      // If campaignId is provided, fetch sessions for that campaign
      if (campaignId) {
        setSelectedCampaign(campaignId);
        await fetchSessions(campaignId);
      }

      // If sessionId is provided, set it as selected
      if (sessionId) {
        setSelectedSession(sessionId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (campaignId: string) => {
    try {
      const sessionsData = await SessionService.getSessionsByCampaignId(campaignId);
      setSessions(sessionsData.map(session => ({
        id: session.id,
        name: session.name
      })));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions. Please try again.');
    }
  };

  const updateContextName = () => {
    if (selectedSession) {
      const session = sessions.find(s => s.id === selectedSession);
      if (session) {
        setContextName(session.name);
        return;
      }
    }

    if (selectedCampaign) {
      const campaign = campaigns.find(c => c.id === selectedCampaign);
      if (campaign) {
        setContextName(campaign.name);
        return;
      }
    }

    setContextName('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCampaignChange = (event: SelectChangeEvent<string>) => {
    const campaignId = event.target.value as string;
    setSelectedCampaign(campaignId);

    // Update URL
    if (campaignId) {
      navigate(`/storytelling/campaign/${campaignId}`);
    } else {
      navigate('/storytelling');
    }
  };

  const handleSessionChange = (event: SelectChangeEvent<string>) => {
    const sessionId = event.target.value as string;
    setSelectedSession(sessionId);

    // Update URL
    if (sessionId) {
      navigate(`/storytelling/session/${sessionId}`);
    } else if (selectedCampaign) {
      navigate(`/storytelling/campaign/${selectedCampaign}`);
    } else {
      navigate('/storytelling');
    }
  };

  const handleProposalGenerated = (proposalId: string) => {
    // Navigate to the proposal review page
    navigate(`/proposals/${proposalId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Storytelling Assistant
      </Typography>

      {contextName && (
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {contextName}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="campaign-select-label">Campaign</InputLabel>
                <Select
                  labelId="campaign-select-label"
                  id="campaign-select"
                  value={selectedCampaign}
                  onChange={handleCampaignChange}
                  label="Campaign"
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedCampaign || sessions.length === 0}>
                <InputLabel id="session-select-label">Session</InputLabel>
                <Select
                  labelId="session-select-label"
                  id="session-select"
                  value={selectedSession}
                  onChange={handleSessionChange}
                  label="Session"
                  disabled={loading || !selectedCampaign || sessions.length === 0}
                >
                  <MenuItem value="">
                    <em>None (Campaign Level)</em>
                  </MenuItem>
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="storytelling tabs">
            <Tab label="Storytelling Interface" />
            <Tab label="History" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <StorytellingInterface
            campaignId={selectedCampaign}
            sessionId={selectedSession}
            onProposalGenerated={handleProposalGenerated}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversation History
            </Typography>
            <Typography variant="body1">
              Your past storytelling sessions will appear here.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storytelling Settings
            </Typography>
            <Typography variant="body1">
              Configure your storytelling assistant preferences here.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StorytellingPage;
