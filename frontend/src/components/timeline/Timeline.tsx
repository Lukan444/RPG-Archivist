import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider, CircularProgress } from '@mui/material';
import { TimelineItem } from './TimelineItem';
import { TimelineFilter } from './TimelineFilter';
import { TimelineControls } from './TimelineControls';
import { TimelineGroup } from './TimelineGroup';

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: string;
  entityId?: string;
  entityType?: string;
  color?: string;
  icon?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onEventClick?: (event: TimelineEvent) => void;
  groupByDate?: boolean;
  showControls?: boolean;
  showFilters?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({
  events,
  title = 'Timeline',
  description,
  loading = false,
  error = null,
  onEventClick,
  groupByDate = false,
  showControls = true,
  showFilters = true,
}) => {
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>(events);
  const [filters, setFilters] = useState<{ types: string[] }>({ types: [] });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Update filtered events when events or filters change
  useEffect(() => {
    let result = [...events];

    // Apply type filters if any are selected
    if (filters.types.length > 0) {
      result = result.filter(event => filters.types.includes(event.type));
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredEvents(result);
  }, [events, filters, sortDirection]);

  // Get unique event types for filters
  const eventTypes = Array.from(new Set(events.map(event => event.type)));

  // Group events by date if needed
  const groupedEvents = groupByDate
    ? filteredEvents.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
        const date = new Date(event.date).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(event);
        return groups;
      }, {})
    : null;

  // Handle filter changes
  const handleFilterChange = (types: string[]) => {
    setFilters({ ...filters, types });
  };

  // Handle sort direction change
  const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
    setSortDirection(direction);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>

        {showControls && (
          <TimelineControls
            sortDirection={sortDirection}
            onSortDirectionChange={handleSortDirectionChange}
          />
        )}
      </Box>

      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}

      {showFilters && eventTypes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TimelineFilter
            types={eventTypes}
            selectedTypes={filters.types}
            onFilterChange={handleFilterChange}
          />
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" sx={{ p: 4 }}>
          {error}
        </Typography>
      ) : filteredEvents.length === 0 ? (
        <Typography align="center" sx={{ p: 4 }}>
          No events to display.
        </Typography>
      ) : groupByDate && groupedEvents ? (
        // Grouped display
        <Box>
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <TimelineGroup
              key={date}
              date={date}
              events={dateEvents}
              onEventClick={onEventClick}
            />
          ))}
        </Box>
      ) : (
        // Flat display
        <Box>
          {filteredEvents.map((event) => (
            <TimelineItem
              key={event.id}
              event={event}
              onClick={() => onEventClick && onEventClick(event)}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export { Timeline };
