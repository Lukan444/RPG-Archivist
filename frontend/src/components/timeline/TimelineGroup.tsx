import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { TimelineItem } from './TimelineItem';
import { TimelineEvent } from './Timeline';

interface TimelineGroupProps {
  date: string;
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

const TimelineGroup: React.FC<TimelineGroupProps> = ({
  date,
  events,
  onEventClick,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium' }}>
          {date}
        </Typography>
        <Divider sx={{ flex: 1, ml: 2 }} />
      </Box>

      <Box sx={{ pl: 2 }}>
        {events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            onClick={() => onEventClick && onEventClick(event)}
          />
        ))}
      </Box>
    </Box>
  );
};

export { TimelineGroup };
