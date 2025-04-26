import React from 'react';
import { Box, IconButton, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  SortByAlpha as SortIcon,
  ArrowUpward as AscendingIcon,
  ArrowDownward as DescendingIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
} from '@mui/icons-material';

interface TimelineControlsProps {
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  viewMode?: 'day' | 'week' | 'month';
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  sortDirection,
  onSortDirectionChange,
  viewMode,
  onViewModeChange,
}) => {
  // Toggle sort direction
  const handleSortDirectionToggle = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'day' | 'week' | 'month' | null,
  ) => {
    if (newMode !== null && onViewModeChange) {
      onViewModeChange(newMode);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Sort Direction Toggle */}
      <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Oldest to Newest' : 'Newest to Oldest'}`}>
        <IconButton onClick={handleSortDirectionToggle} size="small">
          <SortIcon />
          {sortDirection === 'asc' ? <AscendingIcon fontSize="small" /> : <DescendingIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* View Mode Toggle (if provided) */}
      {onViewModeChange && viewMode && (
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{ ml: 2 }}
        >
          <ToggleButton value="day">
            <Tooltip title="Day View">
              <ViewDayIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="week">
            <Tooltip title="Week View">
              <ViewWeekIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Box>
  );
};

export { TimelineControls };
