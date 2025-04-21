import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Chip, 
  Divider,
  Paper,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { TagOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface Topic {
  topic_id: string;
  name: string;
  keywords: string[];
  relevance_score: number;
  segment_ids: string[];
}

interface TopicsListProps {
  topics: Topic[];
  onTopicClick?: (topic: Topic) => void;
}

const TopicsList: React.FC<TopicsListProps> = ({ 
  topics,
  onTopicClick
}) => {
  const theme = useTheme();

  // Format relevance score as percentage
  const formatRelevanceScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  // Get topic color
  const getTopicColor = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main
    ];
    
    return colors[index % colors.length];
  };

  if (!topics || topics.length === 0) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No topics available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          <TagOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
          Topics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {topics.map((topic, index) => (
            <React.Fragment key={topic.topic_id}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  py: 1.5
                }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    width: '100%',
                    cursor: onTopicClick ? 'pointer' : 'default',
                    '&:hover': onTopicClick ? {
                      bgcolor: theme.palette.action.hover
                    } : {},
                    borderLeft: `4px solid ${getTopicColor(index)}`
                  }}
                  onClick={() => onTopicClick && onTopicClick(topic)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ color: getTopicColor(index) }}>
                        {topic.name}
                      </Typography>
                      <Chip
                        label={`Relevance: ${formatRelevanceScore(topic.relevance_score)}`}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={topic.relevance_score * 100}
                        sx={{ 
                          height: 6,
                          borderRadius: 3,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getTopicColor(index)
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {topic.keywords.map((keyword, i) => (
                        <Chip
                          key={i}
                          label={keyword}
                          size="small"
                          sx={{ 
                            bgcolor: `${getTopicColor(index)}20`,
                            color: getTopicColor(index)
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default TopicsList;
