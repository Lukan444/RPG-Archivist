import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider,
  Grid,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardActions,
  SelectChangeEvent
} from '@mui/material';
import {
  ContentAnalysisService,
  SuggestionType,
  ConfidenceLevel,
  ContentAnalysisRequest,
  ContentAnalysisResult
} from '../../services/api/content-analysis.service';
import TranscriptionService, { TranscriptionStatus } from '../../services/api/transcription.service';
import SessionAnalysisService, { AnalysisStatus } from '../../services/api/session-analysis.service';

// LLM model interface
interface LLMModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  capabilities: string[];
}

// Mock LLM service
const LLMService = {
  getModels: async (): Promise<LLMModel[]> => {
    return [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        maxTokens: 8192,
        capabilities: ['text-generation', 'content-analysis']
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        maxTokens: 4096,
        capabilities: ['text-generation', 'content-analysis']
      }
    ];
  },
  getConfig: async () => {
    return {
      defaultModel: 'gpt-3.5-turbo'
    };
  }
};

interface ContentAnalyzerProps {
  contextId?: string;
  contextType?: string;
  onAnalysisComplete?: (result: ContentAnalysisResult) => void;
}

const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({
  contextId,
  contextType,
  onAnalysisComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [transcriptions, setTranscriptions] = useState<{ id: string; name: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedTranscription, setSelectedTranscription] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [customContent, setCustomContent] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<SuggestionType[]>([
    SuggestionType.CHARACTER,
    SuggestionType.LOCATION,
    SuggestionType.RELATIONSHIP
  ]);
  const [minConfidence, setMinConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.MEDIUM);
  const [maxResults, setMaxResults] = useState<number>(10);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContentAnalysisResult | null>(null);

  useEffect(() => {
    fetchData();
  }, [contextId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch available LLM models
      const models = await LLMService.getModels();
      setModels(models);

      // Set default model if available
      if (models.length > 0) {
        const config = await LLMService.getConfig();
        setSelectedModel(config.defaultModel);
      }

      // Fetch transcriptions if context ID is provided
      if (contextId) {
        let transcriptions: { id: string; name: string }[] = [];

        if (contextType === 'session') {
          // Fetch transcriptions for session
          const sessionTranscriptions = await TranscriptionService.getTranscriptionsBySessionId(contextId);
          transcriptions = sessionTranscriptions.map(t => ({
            id: t.id,
            name: t.name || `Transcription ${new Date(t.createdAt).toLocaleDateString()}`
          }));
        } else if (contextType === 'campaign') {
          // Fetch sessions for campaign
          const campaignSessions = await SessionAnalysisService.getSessionsByContextId(contextId);

          // Fetch transcriptions for each session
          for (const session of campaignSessions) {
            const sessionTranscriptions = await TranscriptionService.getTranscriptionsBySessionId(session.id);
            transcriptions = [
              ...transcriptions,
              ...sessionTranscriptions.map(t => ({
                id: t.id,
                name: `${session.name} - ${t.name || `Transcription ${new Date(t.createdAt).toLocaleDateString()}`}`
              }))
            ];
          }
        }

        setTranscriptions(transcriptions);

        // Fetch sessions if context is campaign
        if (contextType === 'campaign') {
          const campaignSessions = await SessionAnalysisService.getSessionsByContextId(contextId);
          setSessions(campaignSessions.map(s => ({
            id: s.id,
            name: s.name
          })));
        } else if (contextType === 'session') {
          setSessions([{
            id: contextId,
            name: 'Current Session'
          }]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };

  const handleTranscriptionChange = (event: SelectChangeEvent<string>) => {
    setSelectedTranscription(event.target.value);
  };

  const handleSessionChange = (event: SelectChangeEvent<string>) => {
    setSelectedSession(event.target.value);
  };

  const handleCustomContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomContent(event.target.value);
  };

  const handleTypeChange = (type: SuggestionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleMinConfidenceChange = (event: SelectChangeEvent<ConfidenceLevel>) => {
    setMinConfidence(event.target.value as ConfidenceLevel);
  };

  const handleMaxResultsChange = (event: SelectChangeEvent<number>) => {
    setMaxResults(Number(event.target.value));
  };

  const handleCustomPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(event.target.value);
  };

  const handleUseCustomPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCustomPrompt(event.target.checked);
  };

  const handleAnalyzeContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalysisResult(null);

      // Validate inputs
      if (selectedTypes.length === 0) {
        setError('Please select at least one analysis type');
        return;
      }

      if (!customContent && !selectedTranscription && !selectedSession) {
        setError('Please provide content, select a transcription, or select a session');
        return;
      }

      // Prepare analysis request
      const request: ContentAnalysisRequest = {
        contextId,
        contextType,
        analysisTypes: selectedTypes,
        options: {
          maxResults,
          minConfidence,
          model: selectedModel
        }
      };

      // Set content source
      if (customContent) {
        request.content = customContent;
      }

      if (selectedTranscription) {
        request.transcriptionId = selectedTranscription;
      }

      if (selectedSession) {
        request.sessionId = selectedSession;
      }

      // Set custom prompt if enabled
      if (useCustomPrompt && customPrompt) {
        request.options!.customPrompt = customPrompt;
      }

      // Analyze content
      const result = await ContentAnalysisService.analyzeContent(request);

      setAnalysisResult(result);

      // Call onAnalysisComplete callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      setError('Failed to analyze content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionTypeName = (type: SuggestionType): string => {
    switch (type) {
      case SuggestionType.CHARACTER:
        return 'Characters';
      case SuggestionType.LOCATION:
        return 'Locations';
      case SuggestionType.ITEM:
        return 'Items';
      case SuggestionType.EVENT:
        return 'Events';
      case SuggestionType.RELATIONSHIP:
        return 'Relationships';
      case SuggestionType.LORE:
        return 'Lore';
      case SuggestionType.DIALOG:
        return 'Dialog';
      case SuggestionType.PLOT:
        return 'Plot';
      case SuggestionType.NOTE:
        return 'Notes';
      default:
        return type;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Content Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {analysisResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Analysis completed successfully! Found {analysisResult.suggestions.length} suggestions.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
              labelId="model-select-label"
              id="model-select"
              value={selectedModel}
              onChange={handleModelChange}
              label="Model"
              disabled={loading}
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom>
            Analysis Types
          </Typography>
          <FormGroup sx={{ mb: 2 }}>
            <Grid container spacing={1}>
              {Object.values(SuggestionType).map((type) => (
                <Grid item xs={6} key={type}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeChange(type)}
                        disabled={loading}
                      />
                    }
                    label={getSuggestionTypeName(type)}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="confidence-select-label">Min Confidence</InputLabel>
                <Select
                  labelId="confidence-select-label"
                  id="confidence-select"
                  value={minConfidence}
                  onChange={handleMinConfidenceChange}
                  label="Min Confidence"
                  disabled={loading}
                >
                  <MenuItem value={ConfidenceLevel.LOW}>Low</MenuItem>
                  <MenuItem value={ConfidenceLevel.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={ConfidenceLevel.HIGH}>High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="max-results-select-label">Max Results</InputLabel>
                <Select
                  labelId="max-results-select-label"
                  id="max-results-select"
                  value={maxResults}
                  onChange={handleMaxResultsChange}
                  label="Max Results"
                  disabled={loading}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={useCustomPrompt}
                onChange={handleUseCustomPromptChange}
                disabled={loading}
              />
            }
            label="Use custom prompt"
          />

          {useCustomPrompt && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Custom Prompt"
              value={customPrompt}
              onChange={handleCustomPromptChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Content Source
          </Typography>

          {transcriptions.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="transcription-select-label">Transcription</InputLabel>
              <Select
                labelId="transcription-select-label"
                id="transcription-select"
                value={selectedTranscription}
                onChange={handleTranscriptionChange}
                label="Transcription"
                disabled={loading}
              >
                <MenuItem value="">None</MenuItem>
                {transcriptions.map((transcription) => (
                  <MenuItem key={transcription.id} value={transcription.id}>
                    {transcription.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {sessions.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="session-select-label">Session</InputLabel>
              <Select
                labelId="session-select-label"
                id="session-select"
                value={selectedSession}
                onChange={handleSessionChange}
                label="Session"
                disabled={loading}
              >
                <MenuItem value="">None</MenuItem>
                {sessions.map((session) => (
                  <MenuItem key={session.id} value={session.id}>
                    {session.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="subtitle2" gutterBottom>
            Custom Content
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Content to analyze"
            value={customContent}
            onChange={handleCustomContentChange}
            disabled={loading}
            placeholder="Enter text to analyze..."
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyzeContent}
              disabled={loading || (selectedTypes.length === 0) || (!customContent && !selectedTranscription && !selectedSession)}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Analyzing...' : 'Analyze Content'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {analysisResult && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Analysis Results
          </Typography>

          <Grid container spacing={2}>
            {Object.values(SuggestionType).map(type => {
              const typeSuggestions = analysisResult.suggestions.filter(s => s.type === type);

              if (typeSuggestions.length === 0) {
                return null;
              }

              return (
                <Grid item xs={12} key={type}>
                  <Typography variant="subtitle1" gutterBottom>
                    {getSuggestionTypeName(type)} ({typeSuggestions.length})
                  </Typography>

                  <Grid container spacing={2}>
                    {typeSuggestions.map(suggestion => (
                      <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {suggestion.title}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                              <Chip
                                label={suggestion.confidence}
                                size="small"
                                color={
                                  suggestion.confidence === ConfidenceLevel.HIGH
                                    ? 'success'
                                    : suggestion.confidence === ConfidenceLevel.MEDIUM
                                    ? 'primary'
                                    : 'default'
                                }
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              {suggestion.description}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button size="small" color="primary">
                              View Details
                            </Button>
                            <Button size="small" color="success">
                              Accept
                            </Button>
                            <Button size="small" color="error">
                              Reject
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ContentAnalyzer;
