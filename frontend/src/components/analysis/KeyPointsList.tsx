import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Divider,
  Paper
} from '@mui/material';
import { 
  LightbulbOutlined, 
  LocalPoliceOutlined, 
  ExploreOutlined, 
  GroupOutlined, 
  AssignmentOutlined, 
  MenuBookOutlined, 
  MoreHorizOutlined 
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface KeyPoint {
  key_point_id: string;
  text: string;
  segment_ids: string[];
  importance_score: number;
  category: string;
}

interface KeyPointsListProps {
  keyPoints: KeyPoint[];
  onKeyPointClick?: (keyPoint: KeyPoint) => void;
}

const KeyPointsList: React.FC<KeyPointsListProps> = ({ 
  keyPoints,
  onKeyPointClick
}) => {
  const theme = useTheme();

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'decision':
        return <LightbulbOutlined />;
      case 'combat':
        return <LocalPoliceOutlined />;
      case 'discovery':
        return <ExploreOutlined />;
      case 'interaction':
        return <GroupOutlined />;
      case 'quest':
        return <AssignmentOutlined />;
      case 'lore':
        return <MenuBookOutlined />;
      default:
        return <MoreHorizOutlined />;
    }
  };

  // Get color for category
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'decision':
        return theme.palette.info.main;
      case 'combat':
        return theme.palette.error.main;
      case 'discovery':
        return theme.palette.success.main;
      case 'interaction':
        return theme.palette.warning.main;
      case 'quest':
        return theme.palette.primary.main;
      case 'lore':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format importance score as percentage
  const formatImportanceScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  if (!keyPoints || keyPoints.length === 0) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No key points available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Key Points
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {keyPoints.map((keyPoint, index) => (
            <React.Fragment key={keyPoint.key_point_id}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start"
                button={!!onKeyPointClick}
                onClick={() => onKeyPointClick && onKeyPointClick(keyPoint)}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Chip
                        icon={getCategoryIcon(keyPoint.category)}
                        label={keyPoint.category}
                        size="small"
                        sx={{ 
                          mr: 1,
                          bgcolor: `${getCategoryColor(keyPoint.category)}20`,
                          color: getCategoryColor(keyPoint.category),
                          borderColor: getCategoryColor(keyPoint.category)
                        }}
                        variant="outlined"
                      />
                      <Chip
                        label={`Importance: ${formatImportanceScore(keyPoint.importance_score)}`}
                        size="small"
                        sx={{ 
                          bgcolor: theme.palette.background.default
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body1"
                      color="text.primary"
                      sx={{ mt: 0.5 }}
                    >
                      {keyPoint.text}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default KeyPointsList;
