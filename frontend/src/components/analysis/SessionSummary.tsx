import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { SummarizeOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface SessionSummaryProps {
  summary: string;
  metadata?: {
    model_version: string;
    processing_time_seconds: number;
    word_count: number;
    confidence_score: number;
    additional_info?: Record<string, any>;
  };
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ 
  summary,
  metadata
}) => {
  const theme = useTheme();

  if (!summary) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No summary available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          <SummarizeOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
          Session Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
              {summary}
            </Typography>
          </CardContent>
        </Card>
        
        {metadata && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <span>Model: {metadata.model_version || 'Unknown'}</span>
              <span>•</span>
              <span>Processing Time: {metadata.processing_time_seconds.toFixed(2)}s</span>
              <span>•</span>
              <span>Word Count: {metadata.word_count}</span>
              <span>•</span>
              <span>Confidence: {Math.round(metadata.confidence_score * 100)}%</span>
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SessionSummary;
