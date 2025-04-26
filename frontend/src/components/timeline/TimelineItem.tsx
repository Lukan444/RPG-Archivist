import React from 'react';
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import {
  Event as EventIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
  Category as ItemIcon,
  Star as PowerIcon,
  Campaign as CampaignIcon,
  VideoLibrary as SessionIcon,
  Public as WorldIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { TimelineEvent } from './Timeline';
import { entityColors } from './utils';

// Map of entity types to icons
const entityIcons: Record<string, React.ReactNode> = {
  event: <EventIcon />,
  location: <PlaceIcon />,
  character: <PersonIcon />,
  item: <ItemIcon />,
  power: <PowerIcon />,
  campaign: <CampaignIcon />,
  session: <SessionIcon />,
  world: <WorldIcon />,
  default: <InfoIcon />
};

interface TimelineItemProps {
  event: TimelineEvent;
  onClick?: () => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, onClick }) => {
  // Determine icon and color based on event type or entity type
  const icon = event.icon ? event.icon :
    entityIcons[event.entityType?.toLowerCase() || event.type.toLowerCase()] ||
    entityIcons.default;

  const color = event.color ? event.color :
    entityColors[event.entityType?.toLowerCase() || event.type.toLowerCase()] ||
    entityColors.default;

  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderLeft: `4px solid ${color}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: 3
        },
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" component="h3">
              {event.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={event.type}
          size="small"
          sx={{
            bgcolor: `${color}20`, // 20% opacity of the color
            color: color,
            fontWeight: 'medium'
          }}
        />
      </Box>

      {event.description && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {event.description}
        </Typography>
      )}
    </Paper>
  );
};

export { TimelineItem };
