import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Chip, 
  Divider,
  Paper,
  Collapse,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Avatar
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoStoriesOutlined,
  PersonOutlined,
  LocationOnOutlined,
  InventoryOutlined,
  EventOutlined,
  HelpOutlineOutlined
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface RelatedEntity {
  entity_id: string;
  entity_type: string;
  name: string;
  relevance_score: number;
}

interface PlotDevelopment {
  plot_development_id: string;
  title: string;
  description: string;
  segment_ids: string[];
  importance_score: number;
  related_entities: RelatedEntity[];
}

interface PlotDevelopmentsListProps {
  plotDevelopments: PlotDevelopment[];
  onPlotDevelopmentClick?: (plotDevelopment: PlotDevelopment) => void;
}

const PlotDevelopmentsList: React.FC<PlotDevelopmentsListProps> = ({ 
  plotDevelopments,
  onPlotDevelopmentClick
}) => {
  const theme = useTheme();
  const [expandedDevelopments, setExpandedDevelopments] = useState<Record<string, boolean>>({});

  // Toggle development expansion
  const toggleDevelopmentExpansion = (developmentId: string) => {
    setExpandedDevelopments(prev => ({
      ...prev,
      [developmentId]: !prev[developmentId]
    }));
  };

  // Format importance score as percentage
  const formatImportanceScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  // Get entity icon
  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'character':
        return <PersonOutlined />;
      case 'location':
        return <LocationOnOutlined />;
      case 'item':
        return <InventoryOutlined />;
      case 'event':
        return <EventOutlined />;
      default:
        return <HelpOutlineOutlined />;
    }
  };

  // Get entity color
  const getEntityColor = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'character':
        return theme.palette.primary.main;
      case 'location':
        return theme.palette.success.main;
      case 'item':
        return theme.palette.warning.main;
      case 'event':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (!plotDevelopments || plotDevelopments.length === 0) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No plot developments available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          <AutoStoriesOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
          Plot Developments
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {plotDevelopments.map((development, index) => (
            <React.Fragment key={development.plot_development_id}>
              {index > 0 && <Divider component="li" />}
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  py: 1.5,
                  flexDirection: 'column'
                }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    width: '100%',
                    cursor: onPlotDevelopmentClick ? 'pointer' : 'default',
                    '&:hover': onPlotDevelopmentClick ? {
                      bgcolor: theme.palette.action.hover
                    } : {}
                  }}
                  onClick={() => onPlotDevelopmentClick && onPlotDevelopmentClick(development)}
                >
                  <CardHeader
                    title={development.title}
                    action={
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDevelopmentExpansion(development.plot_development_id);
                        }}
                      >
                        {expandedDevelopments[development.plot_development_id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    }
                    subheader={
                      <Chip
                        label={`Importance: ${formatImportanceScore(development.importance_score)}`}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Typography variant="body1">
                      {development.description}
                    </Typography>
                    
                    <Collapse in={expandedDevelopments[development.plot_development_id]} sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Related Entities:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {development.related_entities.map((entity, i) => (
                          <Chip
                            key={i}
                            icon={getEntityIcon(entity.entity_type)}
                            label={entity.name}
                            size="small"
                            sx={{ 
                              bgcolor: `${getEntityColor(entity.entity_type)}20`,
                              color: getEntityColor(entity.entity_type),
                              borderColor: getEntityColor(entity.entity_type)
                            }}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Collapse>
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

export default PlotDevelopmentsList;
