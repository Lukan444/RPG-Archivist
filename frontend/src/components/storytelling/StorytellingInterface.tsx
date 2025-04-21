import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { LLMService } from '../../services/api/llm.service';
import { ChangeProposalService, ProposalEntityType } from '../../services/api/change-proposal.service';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface Entity {
  id: string;
  name: string;
  type: string;
}

interface StorytellingInterfaceProps {
  campaignId?: string;
  sessionId?: string;
  onProposalGenerated?: (proposalId: string) => void;
}

const StorytellingInterface: React.FC<StorytellingInterfaceProps> = ({
  campaignId,
  sessionId,
  onProposalGenerated
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'current' | 'past'>('current');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [extractedInfo, setExtractedInfo] = useState<Record<string, any> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with a system message
    const systemMessage: Message = {
      id: 'system-1',
      role: 'system',
      content: mode === 'current' 
        ? 'I am your RPG campaign assistant. I can help you with your current session by answering questions and providing suggestions based on your campaign data.'
        : 'I am your RPG campaign assistant. Tell me about past sessions or events that weren\'t recorded, and I\'ll help extract important information to update your campaign database.',
      timestamp: Date.now()
    };

    const welcomeMessage: Message = {
      id: 'assistant-1',
      role: 'assistant',
      content: mode === 'current'
        ? 'Welcome to your RPG session assistant! How can I help with your current session?'
        : 'Welcome to the storytelling mode! Tell me about past sessions or events that weren\'t recorded, and I\'ll help extract important information to update your campaign database.',
      timestamp: Date.now()
    };

    setMessages([systemMessage, welcomeMessage]);

    // Fetch relevant entities if campaign or session ID is provided
    if (campaignId || sessionId) {
      fetchEntities();
    }
  }, [mode, campaignId, sessionId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchEntities = async () => {
    try {
      // This would be replaced with actual API calls to fetch entities
      // For now, we'll use placeholder data
      const mockEntities: Entity[] = [
        { id: '1', name: 'Elminster', type: 'character' },
        { id: '2', name: 'Waterdeep', type: 'location' },
        { id: '3', name: 'The Battle of Neverwinter', type: 'event' },
        { id: '4', name: 'Sword of Kas', type: 'item' }
      ];
      
      setEntities(mockEntities);
    } catch (error) {
      console.error('Error fetching entities:', error);
      setError('Failed to load entities. Please try again.');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Prepare context for the LLM
      let context = '';
      if (mode === 'current') {
        context = 'You are assisting with the current RPG session. Provide helpful information based on the campaign context.';
      } else {
        context = 'You are extracting information from stories about past RPG sessions. Identify characters, locations, events, items, and other important elements.';
      }

      // Call LLM service
      const response = await LLMService.chat([
        { role: 'system', content: context },
        ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input }
      ]);

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If in past mode, extract information
      if (mode === 'past') {
        await extractInformation(userMessage.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractInformation = async (content: string) => {
    try {
      // Call LLM to extract information
      const response = await LLMService.chat([
        { 
          role: 'system', 
          content: `You are an information extraction system for RPG campaigns. 
          Extract key information from the user's story about past sessions.
          Identify characters, locations, events, items, and relationships.
          Format your response as JSON with the following structure:
          {
            "characters": [{"name": "Name", "description": "Description", "role": "Role"}],
            "locations": [{"name": "Name", "description": "Description"}],
            "events": [{"name": "Name", "description": "Description", "participants": ["Character1", "Character2"]}],
            "items": [{"name": "Name", "description": "Description", "owner": "Owner"}],
            "relationships": [{"source": "Entity1", "target": "Entity2", "type": "FRIEND_OF|ENEMY_OF|etc", "description": "Description"}]
          }`
        },
        { role: 'user', content }
      ]);

      // Parse the JSON response
      const jsonMatch = response.message.content.match(/```json\n([\s\S]*?)\n```/) || 
                        response.message.content.match(/```\n([\s\S]*?)\n```/) ||
                        response.message.content.match(/({[\s\S]*})/);
      
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[1]);
        setExtractedInfo(extractedData);
      } else {
        // Try to parse the entire response as JSON
        try {
          const extractedData = JSON.parse(response.message.content);
          setExtractedInfo(extractedData);
        } catch (e) {
          console.error('Failed to parse extracted information:', e);
          setError('Failed to extract information from the story.');
        }
      }
    } catch (error) {
      console.error('Error extracting information:', error);
      setError('Failed to extract information. Please try again.');
    }
  };

  const handleCreateProposal = async (entityType: ProposalEntityType) => {
    if (!extractedInfo) return;

    try {
      setLoading(true);

      // Prepare data for the proposal based on entity type
      let data: any = {};
      let title = '';
      let description = '';

      switch (entityType) {
        case ProposalEntityType.CHARACTER:
          if (extractedInfo.characters && extractedInfo.characters.length > 0) {
            const character = extractedInfo.characters[0];
            title = `Create Character: ${character.name}`;
            description = `Character extracted from storytelling session`;
            data = {
              name: character.name,
              description: character.description,
              role: character.role
            };
          }
          break;
        case ProposalEntityType.LOCATION:
          if (extractedInfo.locations && extractedInfo.locations.length > 0) {
            const location = extractedInfo.locations[0];
            title = `Create Location: ${location.name}`;
            description = `Location extracted from storytelling session`;
            data = {
              name: location.name,
              description: location.description
            };
          }
          break;
        case ProposalEntityType.EVENT:
          if (extractedInfo.events && extractedInfo.events.length > 0) {
            const event = extractedInfo.events[0];
            title = `Create Event: ${event.name}`;
            description = `Event extracted from storytelling session`;
            data = {
              name: event.name,
              description: event.description,
              participants: event.participants
            };
          }
          break;
        case ProposalEntityType.ITEM:
          if (extractedInfo.items && extractedInfo.items.length > 0) {
            const item = extractedInfo.items[0];
            title = `Create Item: ${item.name}`;
            description = `Item extracted from storytelling session`;
            data = {
              name: item.name,
              description: item.description,
              owner: item.owner
            };
          }
          break;
        case ProposalEntityType.RELATIONSHIP:
          if (extractedInfo.relationships && extractedInfo.relationships.length > 0) {
            const relationship = extractedInfo.relationships[0];
            title = `Create Relationship: ${relationship.source} - ${relationship.target}`;
            description = `Relationship extracted from storytelling session`;
            data = {
              source: relationship.source,
              target: relationship.target,
              type: relationship.type,
              description: relationship.description
            };
          }
          break;
        default:
          break;
      }

      if (Object.keys(data).length === 0) {
        setError(`No ${entityType} information found to create a proposal.`);
        setLoading(false);
        return;
      }

      // Create proposal
      const proposal = {
        type: 'create',
        entityType,
        title,
        description,
        reason: 'Extracted from storytelling session',
        changes: Object.entries(data).map(([field, value]) => ({
          field,
          newValue: value,
          description: `${field} for the ${entityType}`
        })),
        contextId: sessionId || campaignId,
        metadata: {
          source: 'storytelling',
          extractedInfo
        }
      };

      // Call proposal service
      const createdProposal = await ChangeProposalService.createProposal(proposal);

      // Add system message about the proposal
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: `Created proposal for ${entityType}: ${title}`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, systemMessage]);

      // Call callback if provided
      if (onProposalGenerated) {
        onProposalGenerated(createdProposal.id);
      }

      // Clear extracted info after creating proposal
      setExtractedInfo(null);
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: 'current' | 'past') => {
    setMode(newMode);
    setMessages([]);
    setExtractedInfo(null);
  };

  const handleClearChat = () => {
    // Keep only the system and welcome messages
    const systemMessage: Message = {
      id: 'system-1',
      role: 'system',
      content: mode === 'current' 
        ? 'I am your RPG campaign assistant. I can help you with your current session by answering questions and providing suggestions based on your campaign data.'
        : 'I am your RPG campaign assistant. Tell me about past sessions or events that weren\'t recorded, and I\'ll help extract important information to update your campaign database.',
      timestamp: Date.now()
    };

    const welcomeMessage: Message = {
      id: 'assistant-1',
      role: 'assistant',
      content: mode === 'current'
        ? 'Welcome to your RPG session assistant! How can I help with your current session?'
        : 'Welcome to the storytelling mode! Tell me about past sessions or events that weren\'t recorded, and I\'ll help extract important information to update your campaign database.',
      timestamp: Date.now()
    };

    setMessages([systemMessage, welcomeMessage]);
    setExtractedInfo(null);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {mode === 'current' ? 'Session Assistant' : 'Storytelling Mode'}
        </Typography>
        
        <Box>
          <Button
            variant={mode === 'current' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleModeChange('current')}
            sx={{ mr: 1 }}
          >
            Current Session
          </Button>
          
          <Button
            variant={mode === 'past' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleModeChange('past')}
          >
            Past Stories
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              mb: 2,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1
            }}
          >
            {messages.filter(m => m.role !== 'system').map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    boxShadow: 1
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" color={message.role === 'user' ? 'primary.contrastText' : 'text.secondary'}>
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={mode === 'current' 
                ? "Ask about your current session..." 
                : "Tell me about a past session or event..."}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ mr: 1 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              sx={{ alignSelf: 'flex-end' }}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleClearChat}
            >
              Clear Chat
            </Button>
            
            {mode === 'current' && entities.length > 0 && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="entity-select-label">Reference Entity</InputLabel>
                <Select
                  labelId="entity-select-label"
                  id="entity-select"
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value as string)}
                  label="Reference Entity"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {entities.map((entity) => (
                    <MenuItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {mode === 'past' && extractedInfo && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Extracted Information
              </Typography>
              
              {extractedInfo.characters && extractedInfo.characters.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Characters
                    </Typography>
                    {extractedInfo.characters.map((character: any, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1">{character.name}</Typography>
                        <Typography variant="body2">{character.description}</Typography>
                        {character.role && (
                          <Chip label={character.role} size="small" sx={{ mt: 1 }} />
                        )}
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleCreateProposal(ProposalEntityType.CHARACTER)}
                    >
                      Create Proposal
                    </Button>
                  </CardActions>
                </Card>
              )}
              
              {extractedInfo.locations && extractedInfo.locations.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Locations
                    </Typography>
                    {extractedInfo.locations.map((location: any, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1">{location.name}</Typography>
                        <Typography variant="body2">{location.description}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleCreateProposal(ProposalEntityType.LOCATION)}
                    >
                      Create Proposal
                    </Button>
                  </CardActions>
                </Card>
              )}
              
              {extractedInfo.events && extractedInfo.events.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Events
                    </Typography>
                    {extractedInfo.events.map((event: any, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1">{event.name}</Typography>
                        <Typography variant="body2">{event.description}</Typography>
                        {event.participants && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption">Participants:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {event.participants.map((participant: string, i: number) => (
                                <Chip key={i} label={participant} size="small" />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleCreateProposal(ProposalEntityType.EVENT)}
                    >
                      Create Proposal
                    </Button>
                  </CardActions>
                </Card>
              )}
              
              {extractedInfo.items && extractedInfo.items.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Items
                    </Typography>
                    {extractedInfo.items.map((item: any, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="body2">{item.description}</Typography>
                        {item.owner && (
                          <Typography variant="caption">Owner: {item.owner}</Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleCreateProposal(ProposalEntityType.ITEM)}
                    >
                      Create Proposal
                    </Button>
                  </CardActions>
                </Card>
              )}
              
              {extractedInfo.relationships && extractedInfo.relationships.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Relationships
                    </Typography>
                    {extractedInfo.relationships.map((relationship: any, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1">
                          {relationship.source} → {relationship.type} → {relationship.target}
                        </Typography>
                        <Typography variant="body2">{relationship.description}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleCreateProposal(ProposalEntityType.RELATIONSHIP)}
                    >
                      Create Proposal
                    </Button>
                  </CardActions>
                </Card>
              )}
            </Box>
          )}
          
          {mode === 'current' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Session Context
              </Typography>
              
              {campaignId && (
                <Typography variant="body2" gutterBottom>
                  Campaign ID: {campaignId}
                </Typography>
              )}
              
              {sessionId && (
                <Typography variant="body2" gutterBottom>
                  Session ID: {sessionId}
                </Typography>
              )}
              
              {entities.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Entities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {entities.map((entity) => (
                      <Chip
                        key={entity.id}
                        label={entity.name}
                        color="primary"
                        variant="outlined"
                        onClick={() => setSelectedEntity(entity.id)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Ask questions about your current session, and I'll provide information and suggestions based on your campaign data.
              </Alert>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StorytellingInterface;
