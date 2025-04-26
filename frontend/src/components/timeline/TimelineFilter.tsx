import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { entityColors } from './utils';

interface TimelineFilterProps {
  types: string[];
  selectedTypes: string[];
  onFilterChange: (types: string[]) => void;
}

const TimelineFilter: React.FC<TimelineFilterProps> = ({
  types,
  selectedTypes,
  onFilterChange,
}) => {
  // Handle chip click to toggle selection
  const handleTypeClick = (type: string) => {
    if (selectedTypes.includes(type)) {
      // Remove type if already selected
      onFilterChange(selectedTypes.filter(t => t !== type));
    } else {
      // Add type if not selected
      onFilterChange([...selectedTypes, type]);
    }
  };

  // Handle "Select All" click
  const handleSelectAll = () => {
    if (selectedTypes.length === types.length) {
      // Deselect all if all are selected
      onFilterChange([]);
    } else {
      // Select all if not all are selected
      onFilterChange([...types]);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          Filter by type:
        </Typography>
        <Chip
          label={selectedTypes.length === types.length ? "Deselect All" : "Select All"}
          onClick={handleSelectAll}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {types.map((type) => {
          const color = entityColors[type.toLowerCase()] || entityColors.default;
          const isSelected = selectedTypes.includes(type);

          return (
            <Chip
              key={type}
              label={type}
              onClick={() => handleTypeClick(type)}
              variant={isSelected ? "filled" : "outlined"}
              size="small"
              sx={{
                bgcolor: isSelected ? `${color}20` : 'transparent',
                color: color,
                borderColor: color,
                '&:hover': {
                  bgcolor: isSelected ? `${color}30` : `${color}10`,
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export { TimelineFilter };
