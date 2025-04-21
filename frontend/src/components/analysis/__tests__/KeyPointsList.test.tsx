import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import KeyPointsList from '../KeyPointsList';

// Create a theme for testing
const theme = createTheme();

// Wrap component with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('KeyPointsList', () => {
  const mockKeyPoints = [
    {
      key_point_id: 'kp1',
      text: 'The party discovered a hidden treasure in the cave.',
      segment_ids: ['segment1'],
      importance_score: 0.8,
      category: 'discovery'
    },
    {
      key_point_id: 'kp2',
      text: 'The group decided to travel to the northern mountains.',
      segment_ids: ['segment2'],
      importance_score: 0.7,
      category: 'decision'
    },
    {
      key_point_id: 'kp3',
      text: 'The heroes defeated the dragon after a fierce battle.',
      segment_ids: ['segment3'],
      importance_score: 0.9,
      category: 'combat'
    }
  ];

  it('renders the key points correctly', () => {
    // Arrange & Act
    renderWithTheme(<KeyPointsList keyPoints={mockKeyPoints} />);
    
    // Assert
    expect(screen.getByText('Key Points')).toBeInTheDocument();
    expect(screen.getByText('The party discovered a hidden treasure in the cave.')).toBeInTheDocument();
    expect(screen.getByText('The group decided to travel to the northern mountains.')).toBeInTheDocument();
    expect(screen.getByText('The heroes defeated the dragon after a fierce battle.')).toBeInTheDocument();
    
    // Check for categories
    expect(screen.getByText('discovery')).toBeInTheDocument();
    expect(screen.getByText('decision')).toBeInTheDocument();
    expect(screen.getByText('combat')).toBeInTheDocument();
    
    // Check for importance scores
    expect(screen.getByText('Importance: 80%')).toBeInTheDocument();
    expect(screen.getByText('Importance: 70%')).toBeInTheDocument();
    expect(screen.getByText('Importance: 90%')).toBeInTheDocument();
  });

  it('calls onKeyPointClick when a key point is clicked', () => {
    // Arrange
    const handleKeyPointClick = jest.fn();
    renderWithTheme(
      <KeyPointsList 
        keyPoints={mockKeyPoints} 
        onKeyPointClick={handleKeyPointClick} 
      />
    );
    
    // Act
    fireEvent.click(screen.getByText('The party discovered a hidden treasure in the cave.'));
    
    // Assert
    expect(handleKeyPointClick).toHaveBeenCalledWith(mockKeyPoints[0]);
  });

  it('displays a message when no key points are available', () => {
    // Arrange & Act
    renderWithTheme(<KeyPointsList keyPoints={[]} />);
    
    // Assert
    expect(screen.getByText('No key points available.')).toBeInTheDocument();
  });
});
