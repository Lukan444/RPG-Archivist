import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Divider,
  Paper,
  Avatar,
  Collapse,
  IconButton,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FormatQuoteOutlined,
  PeopleOutlined
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface NotableQuote {
  text: string;
  segment_id: string;
  start_time: number;
  end_time: number;
  importance_score: number;
}

interface CharacterInteraction {
  character_id?: string;
  speaker_id?: string;
  name: string;
  interaction_count: number;
  sentiment_score: number;
  context: string;
}

interface CharacterInsight {
  character_id?: string;
  speaker_id?: string;
  name: string;
  participation_score: number;
  sentiment_score: number;
  topics_of_interest: string[];
  notable_quotes: NotableQuote[];
  key_interactions: CharacterInteraction[];
}

interface CharacterInsightsListProps {
  characterInsights: CharacterInsight[];
  onQuoteClick?: (quote: NotableQuote, characterName: string) => void;
}

const CharacterInsightsList: React.FC<CharacterInsightsListProps> = ({ 
  characterInsights,
  onQuoteClick
}) => {
  const theme = useTheme();
  const [expandedCharacters, setExpandedCharacters] = useState<Record<string, boolean>>({});

  // Toggle character expansion
  const toggleCharacterExpansion = (characterName: string) => {
    setExpandedCharacters(prev => ({
      ...prev,
      [characterName]: !prev[characterName]
    }));
  };

  // Format participation score as percentage
  const formatParticipationScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  // Get sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 0.6) return theme.palette.success.main;
    if (score >= 0.4) return theme.palette.info.main;
    return theme.palette.error.main;
  };

  // Format sentiment text
  const formatSentimentText = (score: number) => {
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    return 'Negative';
  };

  // Get avatar color
  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const h = Math.abs(hash) % 360;
    const s = 70;
    const l = 60;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // Get avatar initials
  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!characterInsights || characterInsights.length === 0) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No character insights available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Character Insights
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {characterInsights.map((insight, index) => (
            <React.Fragment key={insight.speaker_id || insight.name}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  py: 1.5,
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', mb: expandedCharacters[insight.name] ? 2 : 0 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(insight.name),
                      mr: 2
                    }}
                  >
                    {getAvatarInitials(insight.name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" component="div">
                        {insight.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleCharacterExpansion(insight.name)}
                        sx={{ ml: 1 }}
                      >
                        {expandedCharacters[insight.name] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        label={`Participation: ${formatParticipationScore(insight.participation_score)}`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Sentiment: ${formatSentimentText(insight.sentiment_score)}`}
                        size="small"
                        sx={{ 
                          bgcolor: `${getSentimentColor(insight.sentiment_score)}20`,
                          color: getSentimentColor(insight.sentiment_score)
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Topics of interest:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {insight.topics_of_interest.map((topic, i) => (
                          <Chip
                            key={i}
                            label={topic}
                            size="small"
                            sx={{ 
                              bgcolor: theme.palette.background.default
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                <Collapse in={expandedCharacters[insight.name]} sx={{ width: '100%' }}>
                  {/* Notable Quotes */}
                  {insight.notable_quotes && insight.notable_quotes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <FormatQuoteOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Notable Quotes
                      </Typography>
                      <Grid container spacing={2}>
                        {insight.notable_quotes.map((quote, i) => (
                          <Grid item xs={12} key={i}>
                            <Card 
                              variant="outlined"
                              sx={{ 
                                cursor: onQuoteClick ? 'pointer' : 'default',
                                '&:hover': onQuoteClick ? {
                                  bgcolor: theme.palette.action.hover
                                } : {}
                              }}
                              onClick={() => onQuoteClick && onQuoteClick(quote, insight.name)}
                            >
                              <CardContent>
                                <Typography variant="body1" component="div">
                                  "{quote.text}"
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Importance: {Math.round(quote.importance_score * 100)}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTime(quote.start_time)} - {formatTime(quote.end_time)}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Key Interactions */}
                  {insight.key_interactions && insight.key_interactions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <PeopleOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Key Interactions
                      </Typography>
                      <Grid container spacing={2}>
                        {insight.key_interactions.map((interaction, i) => (
                          <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: getAvatarColor(interaction.name),
                                      width: 32,
                                      height: 32,
                                      mr: 1,
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    {getAvatarInitials(interaction.name)}
                                  </Avatar>
                                  <Typography variant="subtitle1">
                                    {interaction.name}
                                  </Typography>
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Interaction Count: {interaction.interaction_count}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Sentiment:
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={interaction.sentiment_score * 100}
                                      sx={{ 
                                        flexGrow: 1,
                                        mr: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: theme.palette.grey[200],
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: getSentimentColor(interaction.sentiment_score)
                                        }
                                      }}
                                    />
                                    <Typography variant="caption">
                                      {Math.round(interaction.sentiment_score * 100)}%
                                    </Typography>
                                  </Box>
                                </Box>
                                {interaction.context && (
                                  <Typography variant="body2">
                                    "{interaction.context}"
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Collapse>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Format time (seconds to MM:SS)
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default CharacterInsightsList;
