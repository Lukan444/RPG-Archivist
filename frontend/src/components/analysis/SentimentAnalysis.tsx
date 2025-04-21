import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider,
  Grid,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import { 
  SentimentSatisfiedOutlined,
  SentimentNeutralOutlined,
  SentimentDissatisfiedOutlined,
  TimelineOutlined
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface SentimentTimelinePoint {
  time: number;
  sentiment_score: number;
  context: string;
}

interface SentimentAnalysisData {
  overall_sentiment: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentiment_timeline: SentimentTimelinePoint[];
}

interface SentimentAnalysisProps {
  sentimentAnalysis: SentimentAnalysisData;
  onTimelinePointClick?: (timelinePoint: SentimentTimelinePoint) => void;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ 
  sentimentAnalysis,
  onTimelinePointClick
}) => {
  const theme = useTheme();

  // Format sentiment score as percentage
  const formatSentimentScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  // Get sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 0.6) return theme.palette.success.main;
    if (score >= 0.4) return theme.palette.info.main;
    return theme.palette.error.main;
  };

  // Get sentiment text
  const getSentimentText = (score: number) => {
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    return 'Negative';
  };

  // Get sentiment icon
  const getSentimentIcon = (score: number) => {
    if (score >= 0.6) return <SentimentSatisfiedOutlined />;
    if (score >= 0.4) return <SentimentNeutralOutlined />;
    return <SentimentDissatisfiedOutlined />;
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!sentimentAnalysis) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No sentiment analysis available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Sentiment Analysis
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* Overall Sentiment */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Sentiment
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            borderRadius: 2,
            bgcolor: `${getSentimentColor(sentimentAnalysis.overall_sentiment)}20`
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: getSentimentColor(sentimentAnalysis.overall_sentiment),
              color: '#fff',
              mr: 2
            }}>
              {getSentimentIcon(sentimentAnalysis.overall_sentiment)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ color: getSentimentColor(sentimentAnalysis.overall_sentiment) }}>
                {getSentimentText(sentimentAnalysis.overall_sentiment)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Score: {formatSentimentScore(sentimentAnalysis.overall_sentiment)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Sentiment Distribution */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sentiment Distribution
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <SentimentSatisfiedOutlined sx={{ mr: 0.5, fontSize: '1rem', color: theme.palette.success.main }} />
                    Positive
                  </Typography>
                  <Typography variant="body2">
                    {formatSentimentScore(sentimentAnalysis.sentiment_distribution.positive)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={sentimentAnalysis.sentiment_distribution.positive * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.success.main
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <SentimentNeutralOutlined sx={{ mr: 0.5, fontSize: '1rem', color: theme.palette.info.main }} />
                    Neutral
                  </Typography>
                  <Typography variant="body2">
                    {formatSentimentScore(sentimentAnalysis.sentiment_distribution.neutral)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={sentimentAnalysis.sentiment_distribution.neutral * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.info.main
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <SentimentDissatisfiedOutlined sx={{ mr: 0.5, fontSize: '1rem', color: theme.palette.error.main }} />
                    Negative
                  </Typography>
                  <Typography variant="body2">
                    {formatSentimentScore(sentimentAnalysis.sentiment_distribution.negative)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={sentimentAnalysis.sentiment_distribution.negative * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.error.main
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Sentiment Timeline */}
        {sentimentAnalysis.sentiment_timeline && sentimentAnalysis.sentiment_timeline.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineOutlined sx={{ mr: 1 }} />
              Sentiment Timeline
            </Typography>
            <Grid container spacing={2}>
              {sentimentAnalysis.sentiment_timeline.map((point, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: onTimelinePointClick ? 'pointer' : 'default',
                      '&:hover': onTimelinePointClick ? {
                        bgcolor: theme.palette.action.hover
                      } : {},
                      borderLeft: `4px solid ${getSentimentColor(point.sentiment_score)}`
                    }}
                    onClick={() => onTimelinePointClick && onTimelinePointClick(point)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color={getSentimentColor(point.sentiment_score)}>
                          {getSentimentText(point.sentiment_score)}
                        </Typography>
                        <Typography variant="subtitle2">
                          {formatTime(point.time)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {point.context}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SentimentAnalysis;
