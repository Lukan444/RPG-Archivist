import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SessionSummary from '../SessionSummary';

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

describe('SessionSummary', () => {
  const mockSummary = 'This is a test summary of the session. It includes important events and key moments.';
  const mockMetadata = {
    model_version: 'GPT-4',
    processing_time_seconds: 5.2,
    word_count: 120,
    confidence_score: 0.85
  };

  it('renders the summary correctly', () => {
    // Arrange & Act
    renderWithTheme(<SessionSummary summary={mockSummary} />);
    
    // Assert
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    expect(screen.getByText(mockSummary)).toBeInTheDocument();
  });

  it('renders metadata when provided', () => {
    // Arrange & Act
    renderWithTheme(<SessionSummary summary={mockSummary} metadata={mockMetadata} />);
    
    // Assert
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    expect(screen.getByText(mockSummary)).toBeInTheDocument();
    expect(screen.getByText(/Model: GPT-4/)).toBeInTheDocument();
    expect(screen.getByText(/Processing Time: 5.20s/)).toBeInTheDocument();
    expect(screen.getByText(/Word Count: 120/)).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 85%/)).toBeInTheDocument();
  });

  it('displays a message when no summary is available', () => {
    // Arrange & Act
    renderWithTheme(<SessionSummary summary="" />);
    
    // Assert
    expect(screen.getByText('No summary available.')).toBeInTheDocument();
  });
});
