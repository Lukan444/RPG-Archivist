import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Avatar,
  Grid,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import {
  Send as SendIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import {
  LLMService,
  LLMMessage,
  LLMMessageRole,
  LLMModel
} from '../../services/api/llm.service';

const BrainPage: React.FC = () => {
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with system message
    setMessages([
      {
        role: LLMMessageRole.SYSTEM,
        content: 'You are RPG Archivist\'s AI assistant. You help users manage their RPG campaigns, characters, and worlds. You can provide creative ideas, help with worldbuilding, and assist with game mechanics.'
      }
    ]);

    // Fetch available models
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchModels = async () => {
    try {
      const models = await LLMService.getModels();
      setModels(models);

      // Set default model
      if (models.length > 0) {
        const config = await LLMService.getConfig();
        setSelectedModel(config.defaultModel);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to load available models. Please check your LLM configuration.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: LLMMessage = {
      role: LLMMessageRole.USER,
      content: input
    };

    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Prepare messages for API call (include system message)
      const messagesToSend = [...messages, userMessage];

      // Call LLM API
      const response = await LLMService.chat(messagesToSend, {
        model: selectedModel
      });

      // Add assistant response to chat
      setMessages(prevMessages => [...prevMessages, response.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get a response. Please try again or check your LLM configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: LLMMessageRole.SYSTEM,
        content: 'You are RPG Archivist\'s AI assistant. You help users manage their RPG campaigns, characters, and worlds. You can provide creative ideas, help with worldbuilding, and assist with game mechanics.'
      }
    ]);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const renderMessage = (message: LLMMessage, index: number) => {
    // Skip rendering system messages
    if (message.role === LLMMessageRole.SYSTEM) return null;

    const isUser = message.role === LLMMessageRole.USER;

    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            maxWidth: '80%'
          }}
        >
          {!isUser && (
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 1
              }}
            >
              <PsychologyIcon />
            </Avatar>
          )}
          <Paper
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.main' : 'background.paper',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            {!isUser && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyMessage(message.content)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Paper>
          {isUser && (
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                ml: 1
              }}
            >
              <PersonIcon />
            </Avatar>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Brain</Typography>
        <Box>
          <Tooltip title="LLM Settings">
            <IconButton
              component={RouterLink}
              to="/settings/llm"
              color="primary"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Chat">
            <IconButton
              onClick={handleClearChat}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
              labelId="model-select-label"
              id="model-select"
              value={selectedModel}
              onChange={handleModelChange}
              label="Model"
              disabled={loading || models.length === 0}
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        {messages.filter(m => m.role !== LLMMessageRole.SYSTEM).length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <PsychologyIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom>
              RPG Archivist Brain
            </Typography>
            <Typography variant="body1" align="center" sx={{ maxWidth: 600 }}>
              Ask me anything about your RPG campaigns, characters, or worlds. I can help with creative ideas, worldbuilding, and game mechanics.
            </Typography>
          </Box>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center'
        }}
        elevation={3}
      >
        <TextField
          fullWidth
          placeholder="Ask the Brain..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={loading}
          sx={{ ml: 1, flex: 1 }}
          InputProps={{
            disableUnderline: true,
            sx: { border: 'none' }
          }}
          variant="standard"
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          color="primary"
          sx={{ p: '10px' }}
          onClick={handleSendMessage}
          disabled={!input.trim() || loading}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default BrainPage;
