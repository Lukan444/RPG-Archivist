import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Slider,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LLMConfig, LLMProviderType } from '../../../services/api/llm.service';

interface GeneralLLMSettingsProps {
  config: LLMConfig;
  onUpdate: (config: Partial<LLMConfig>) => Promise<void>;
  loading: boolean;
}

const GeneralLLMSettings: React.FC<GeneralLLMSettingsProps> = ({
  config,
  onUpdate,
  loading
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [formValues, setFormValues] = useState({
    provider: config.provider,
    apiKey: config.apiKey || '',
    baseUrl: config.baseUrl || '',
    defaultModel: config.defaultModel,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    topP: config.topP,
    frequencyPenalty: config.frequencyPenalty,
    presencePenalty: config.presencePenalty,
    timeout: config.timeout,
    cacheEnabled: config.cacheEnabled,
    cacheTTL: config.cacheTTL
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name as string]: value
    });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormValues({
      ...formValues,
      [name]: checked
    });
  };

  const handleSliderChange = (name: string) => (event: Event, newValue: number | number[]) => {
    setFormValues({
      ...formValues,
      [name]: newValue
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpdate(formValues);
  };

  const handleToggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Provider Settings
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="provider-label">LLM Provider</InputLabel>
              <Select
                labelId="provider-label"
                id="provider"
                name="provider"
                value={formValues.provider}
                onChange={handleChange}
                label="LLM Provider"
                disabled={loading}
              >
                <MenuItem value={LLMProviderType.OPENAI}>OpenAI</MenuItem>
                <MenuItem value={LLMProviderType.OLLAMA}>Ollama (Local)</MenuItem>
                <MenuItem value={LLMProviderType.CUSTOM}>Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="default-model-label">Default Model</InputLabel>
              <Select
                labelId="default-model-label"
                id="defaultModel"
                name="defaultModel"
                value={formValues.defaultModel}
                onChange={handleChange}
                label="Default Model"
                disabled={loading}
              >
                {config.models.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="apiKey"
              name="apiKey"
              label="API Key"
              value={formValues.apiKey}
              onChange={handleChange}
              disabled={loading || formValues.provider === LLMProviderType.OLLAMA}
              type={showApiKey ? 'text' : 'password'}
              InputProps={{
                endAdornment: formValues.provider !== LLMProviderType.OLLAMA && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle api key visibility"
                      onClick={handleToggleApiKeyVisibility}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="baseUrl"
              name="baseUrl"
              label="Base URL"
              value={formValues.baseUrl}
              onChange={handleChange}
              disabled={loading}
              helperText={
                formValues.provider === LLMProviderType.OPENAI
                  ? 'Default: https://api.openai.com/v1'
                  : formValues.provider === LLMProviderType.OLLAMA
                  ? 'Default: http://localhost:11434'
                  : 'Enter the base URL for your custom LLM provider'
              }
            />
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Generation Settings
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%' }}>
              <Typography id="temperature-slider" gutterBottom>
                Temperature: {formValues.temperature}
                <Tooltip title="Controls randomness: Lower values are more deterministic, higher values are more creative">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                aria-labelledby="temperature-slider"
                value={formValues.temperature}
                onChange={handleSliderChange('temperature')}
                min={0}
                max={2}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' }
                ]}
                disabled={loading}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%' }}>
              <Typography id="top-p-slider" gutterBottom>
                Top P: {formValues.topP}
                <Tooltip title="Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                aria-labelledby="top-p-slider"
                value={formValues.topP}
                onChange={handleSliderChange('topP')}
                min={0}
                max={1}
                step={0.05}
                marks={[
                  { value: 0, label: '0' },
                  { value: 0.5, label: '0.5' },
                  { value: 1, label: '1' }
                ]}
                disabled={loading}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="maxTokens"
              name="maxTokens"
              label="Max Tokens"
              type="number"
              value={formValues.maxTokens}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Maximum number of tokens to generate">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="timeout"
              name="timeout"
              label="Timeout (ms)"
              type="number"
              value={formValues.timeout}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Request timeout in milliseconds">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%' }}>
              <Typography id="frequency-penalty-slider" gutterBottom>
                Frequency Penalty: {formValues.frequencyPenalty}
                <Tooltip title="Reduces repetition by penalizing tokens that have already appeared in the text">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                aria-labelledby="frequency-penalty-slider"
                value={formValues.frequencyPenalty}
                onChange={handleSliderChange('frequencyPenalty')}
                min={-2}
                max={2}
                step={0.1}
                marks={[
                  { value: -2, label: '-2' },
                  { value: 0, label: '0' },
                  { value: 2, label: '2' }
                ]}
                disabled={loading}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%' }}>
              <Typography id="presence-penalty-slider" gutterBottom>
                Presence Penalty: {formValues.presencePenalty}
                <Tooltip title="Encourages the model to talk about new topics by penalizing tokens that have appeared at all">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                aria-labelledby="presence-penalty-slider"
                value={formValues.presencePenalty}
                onChange={handleSliderChange('presencePenalty')}
                min={-2}
                max={2}
                step={0.1}
                marks={[
                  { value: -2, label: '-2' },
                  { value: 0, label: '0' },
                  { value: 2, label: '2' }
                ]}
                disabled={loading}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Cache Settings
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.cacheEnabled}
                  onChange={handleSwitchChange}
                  name="cacheEnabled"
                  disabled={loading}
                />
              }
              label="Enable Caching"
            />
            <Tooltip title="Cache LLM responses to improve performance and reduce API costs">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="cacheTTL"
              name="cacheTTL"
              label="Cache TTL (ms)"
              type="number"
              value={formValues.cacheTTL}
              onChange={handleChange}
              disabled={loading || !formValues.cacheEnabled}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Time to live for cached responses in milliseconds">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default GeneralLLMSettings;
