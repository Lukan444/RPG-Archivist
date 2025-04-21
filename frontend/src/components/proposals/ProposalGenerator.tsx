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
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  ChangeProposalService,
  ProposalEntityType,
  ProposalTemplate,
  ProposalGenerationRequest
} from '../../services/api/change-proposal.service';
import { LLMService, LLMModel } from '../../services/api/llm.service';

interface ProposalGeneratorProps {
  entityType: ProposalEntityType;
  entityId?: string;
  contextId?: string;
  onProposalGenerated?: (proposalId: string) => void;
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({
  entityType,
  entityId,
  contextId,
  onProposalGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [generatedProposalId, setGeneratedProposalId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [entityType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch templates for the entity type
      const templates = await ChangeProposalService.getTemplates(entityType);
      setTemplates(templates);

      // Set default template if available
      if (templates.length > 0) {
        setSelectedTemplate(templates[0].id);
      }

      // Fetch available LLM models
      const models = await LLMService.getModels();
      setModels(models);

      // Set default model if available
      if (models.length > 0) {
        const config = await LLMService.getConfig();
        setSelectedModel(config.defaultModel);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load templates or models. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedTemplate(event.target.value as string);
  };

  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };

  const handleCustomPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(event.target.value);
  };

  const handleUseCustomPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCustomPrompt(event.target.checked);
  };

  const handleGenerateProposal = async () => {
    try {
      setLoading(true);
      setError(null);
      setGeneratedProposalId(null);

      // Prepare generation request
      const request: ProposalGenerationRequest = {
        entityType,
        entityId,
        contextId,
        model: selectedModel
      };

      if (useCustomPrompt) {
        request.customPrompt = customPrompt;
      } else {
        request.promptId = selectedTemplate;
      }

      // Generate proposal
      const proposal = await ChangeProposalService.generateProposal(request);
      
      setGeneratedProposalId(proposal.id);
      
      // Call onProposalGenerated callback if provided
      if (onProposalGenerated) {
        onProposalGenerated(proposal.id);
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      setError('Failed to generate proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEntityTypeName = (type: ProposalEntityType): string => {
    switch (type) {
      case ProposalEntityType.WORLD:
        return 'World';
      case ProposalEntityType.CAMPAIGN:
        return 'Campaign';
      case ProposalEntityType.SESSION:
        return 'Session';
      case ProposalEntityType.CHARACTER:
        return 'Character';
      case ProposalEntityType.LOCATION:
        return 'Location';
      case ProposalEntityType.ITEM:
        return 'Item';
      case ProposalEntityType.EVENT:
        return 'Event';
      case ProposalEntityType.POWER:
        return 'Power';
      case ProposalEntityType.RELATIONSHIP:
        return 'Relationship';
      default:
        return type;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Generate {getEntityTypeName(entityType)} Proposal
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {generatedProposalId && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Proposal generated successfully!
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomPrompt}
                onChange={handleUseCustomPromptChange}
                disabled={loading}
              />
            }
            label="Use custom prompt"
          />
        </Grid>
        
        {!useCustomPrompt && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={loading || templates.length === 0}>
              <InputLabel id="template-select-label">Template</InputLabel>
              <Select
                labelId="template-select-label"
                id="template-select"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                label="Template"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12} md={useCustomPrompt ? 12 : 6}>
          <FormControl fullWidth disabled={loading || models.length === 0}>
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
              labelId="model-select-label"
              id="model-select"
              value={selectedModel}
              onChange={handleModelChange}
              label="Model"
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {useCustomPrompt && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Custom Prompt"
              value={customPrompt}
              onChange={handleCustomPromptChange}
              disabled={loading}
              placeholder="Enter your custom prompt for generating the proposal..."
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box>
              {entityId && (
                <Chip
                  label={`Entity ID: ${entityId}`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              
              {contextId && (
                <Chip
                  label={`Context ID: ${contextId}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateProposal}
              disabled={loading || (useCustomPrompt ? !customPrompt : !selectedTemplate) || !selectedModel}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Generating...' : 'Generate Proposal'}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {selectedTemplate && !useCustomPrompt && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Selected Template
          </Typography>
          
          {templates.find(t => t.id === selectedTemplate)?.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {templates.find(t => t.id === selectedTemplate)?.description}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ProposalGenerator;
