import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Divider
} from '@mui/material';
import { 
  ArrowBackOutlined, 
  RefreshOutlined, 
  SettingsOutlined,
  SummarizeOutlined,
  LightbulbOutlined,
  PeopleOutlined,
  AutoStoriesOutlined,
  SentimentSatisfiedOutlined,
  TagOutlined
} from '@mui/icons-material';
import { sessionAnalysisService } from '../services/sessionAnalysisService';
import { sessionService } from '../services/sessionService';
import { transcriptionService } from '../services/transcriptionService';
import { 
  KeyPointsList, 
  CharacterInsightsList, 
  PlotDevelopmentsList, 
  SentimentAnalysis, 
  TopicsList, 
  SessionSummary 
} from '../components/analysis';
import { AudioPlayer } from '../components/audio';

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
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
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

const SessionAnalysisPage: React.FC = () => {
  const { sessionId, transcriptionId } = useParams<{ sessionId: string; transcriptionId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);

  // Fetch session analysis
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch session details
        if (sessionId) {
          const sessionResponse = await sessionService.getById(sessionId);
          if (sessionResponse.success) {
            setSessionName(sessionResponse.data.name);
          }
        }
        
        // Try to get analysis by transcription ID first
        if (transcriptionId) {
          try {
            const analysisResponse = await sessionAnalysisService.getByTranscriptionId(transcriptionId);
            if (analysisResponse.success) {
              setAnalysis(analysisResponse.data);
              
              // Set audio URL
              setAudioUrl(`/api/audio-recordings/${analysisResponse.data.recording_id}/stream`);
              return;
            }
          } catch (error) {
            console.log('No analysis found for transcription, will try to create one');
          }
          
          // If no analysis exists, create one
          if (sessionId) {
            const createResponse = await sessionAnalysisService.create(sessionId, transcriptionId);
            if (createResponse.success) {
              setAnalysis(createResponse.data);
              
              // Process the analysis
              await processAnalysis(createResponse.data.analysis_id);
              
              // Get transcription details to set audio URL
              const transcriptionResponse = await transcriptionService.getById(transcriptionId);
              if (transcriptionResponse.success) {
                setAudioUrl(`/api/audio-recordings/${transcriptionResponse.data.recording_id}/stream`);
              }
            }
          }
        }
        // Try to get analysis by session ID
        else if (sessionId) {
          try {
            const analysisResponse = await sessionAnalysisService.getBySessionId(sessionId);
            if (analysisResponse.success) {
              setAnalysis(analysisResponse.data);
              
              // Set audio URL
              setAudioUrl(`/api/audio-recordings/${analysisResponse.data.recording_id}/stream`);
            }
          } catch (error) {
            setError('No analysis found for this session. Please create one from a transcription.');
          }
        }
      } catch (error) {
        console.error('Error fetching session analysis:', error);
        setError('Failed to load session analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sessionId, transcriptionId]);

  // Process analysis
  const processAnalysis = async (analysisId: string) => {
    try {
      setProcessing(true);
      
      const response = await sessionAnalysisService.process(analysisId, {
        include_sentiment_analysis: true,
        include_character_insights: true,
        include_plot_developments: true,
        include_topics: true,
        max_key_points: 10,
        max_topics: 5
      });
      
      if (response.success) {
        setAnalysis(response.data);
        setSuccess('Analysis processed successfully');
      }
    } catch (error) {
      console.error('Error processing analysis:', error);
      setError('Failed to process analysis. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (analysis) {
      processAnalysis(analysis.analysis_id);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (sessionId) {
      navigate(`/sessions/${sessionId}`);
    } else {
      navigate('/sessions');
    }
  };

  // Handle close error
  const handleCloseError = () => {
    setError(null);
  };

  // Handle close success
  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  // Handle segment click
  const handleSegmentClick = (segmentId: string) => {
    setCurrentSegmentId(segmentId);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
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
        
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {sessionName ? `${sessionName} - Analysis` : 'Session Analysis'}
        </Typography>
        
        <Button
          startIcon={<RefreshOutlined />}
          variant="outlined"
          onClick={handleRefresh}
          disabled={processing}
          sx={{ mr: 1 }}
        >
          Refresh
        </Button>
        
        <Button
          startIcon={<SettingsOutlined />}
          variant="outlined"
          disabled={processing}
        >
          Settings
        </Button>
      </Box>
      
      {/* Audio Player */}
      {audioUrl && (
        <Box sx={{ mb: 3 }}>
          <AudioPlayer
            src={audioUrl}
            title="Session Recording"
            segments={analysis?.transcription?.segments?.map((segment: any) => ({
              id: segment.segment_id,
              startTime: segment.start_time,
              endTime: segment.end_time,
              text: segment.text,
              speakerName: segment.speaker_name
            }))}
            currentSegmentId={currentSegmentId || undefined}
            onSegmentChange={handleSegmentClick}
          />
        </Box>
      )}
      
      {/* Analysis Content */}
      {analysis ? (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="analysis tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<SummarizeOutlined />} 
              label="Summary" 
              id="analysis-tab-0" 
              aria-controls="analysis-tabpanel-0" 
            />
            <Tab 
              icon={<LightbulbOutlined />} 
              label="Key Points" 
              id="analysis-tab-1" 
              aria-controls="analysis-tabpanel-1" 
            />
            <Tab 
              icon={<PeopleOutlined />} 
              label="Characters" 
              id="analysis-tab-2" 
              aria-controls="analysis-tabpanel-2" 
            />
            <Tab 
              icon={<AutoStoriesOutlined />} 
              label="Plot" 
              id="analysis-tab-3" 
              aria-controls="analysis-tabpanel-3" 
            />
            <Tab 
              icon={<SentimentSatisfiedOutlined />} 
              label="Sentiment" 
              id="analysis-tab-4" 
              aria-controls="analysis-tabpanel-4" 
            />
            <Tab 
              icon={<TagOutlined />} 
              label="Topics" 
              id="analysis-tab-5" 
              aria-controls="analysis-tabpanel-5" 
            />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <SessionSummary 
              summary={analysis.summary} 
              metadata={analysis.metadata}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <KeyPointsList 
              keyPoints={analysis.key_points || []}
              onKeyPointClick={(keyPoint) => {
                if (keyPoint.segment_ids && keyPoint.segment_ids.length > 0) {
                  handleSegmentClick(keyPoint.segment_ids[0]);
                }
              }}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <CharacterInsightsList 
              characterInsights={analysis.character_insights || []}
              onQuoteClick={(quote) => {
                handleSegmentClick(quote.segment_id);
              }}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <PlotDevelopmentsList 
              plotDevelopments={analysis.plot_developments || []}
              onPlotDevelopmentClick={(plotDevelopment) => {
                if (plotDevelopment.segment_ids && plotDevelopment.segment_ids.length > 0) {
                  handleSegmentClick(plotDevelopment.segment_ids[0]);
                }
              }}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <SentimentAnalysis 
              sentimentAnalysis={analysis.sentiment_analysis || {
                overall_sentiment: 0.5,
                sentiment_distribution: {
                  positive: 0.33,
                  neutral: 0.34,
                  negative: 0.33
                },
                sentiment_timeline: []
              }}
              onTimelinePointClick={(timelinePoint) => {
                // Find segment closest to the timeline point
                const segments = analysis.transcription?.segments || [];
                const closestSegment = segments.reduce((closest: any, segment: any) => {
                  const currentDiff = Math.abs(segment.start_time - timelinePoint.time);
                  const closestDiff = Math.abs(closest.start_time - timelinePoint.time);
                  return currentDiff < closestDiff ? segment : closest;
                }, { start_time: 0 });
                
                if (closestSegment && closestSegment.segment_id) {
                  handleSegmentClick(closestSegment.segment_id);
                }
              }}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <TopicsList 
              topics={analysis.topics || []}
              onTopicClick={(topic) => {
                if (topic.segment_ids && topic.segment_ids.length > 0) {
                  handleSegmentClick(topic.segment_ids[0]);
                }
              }}
            />
          </TabPanel>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            No Analysis Available
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            There is no analysis available for this session. Please create an analysis from a transcription.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/sessions/${sessionId}/recordings`)}
          >
            View Recordings
          </Button>
        </Paper>
      )}
      
      {/* Processing Overlay */}
      {processing && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999
        }}>
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
            Processing Analysis...
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
            This may take a few moments
          </Typography>
        </Box>
      )}
      
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

export default SessionAnalysisPage;
