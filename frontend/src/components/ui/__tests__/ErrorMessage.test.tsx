import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ErrorMessage from '../ErrorMessage';

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

describe('ErrorMessage', () => {
  it('renders with default title and message', () => {
    // Arrange & Act
    renderWithTheme(<ErrorMessage message="Something went wrong" />);
    
    // Assert
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    // Arrange & Act
    renderWithTheme(<ErrorMessage title="Custom Error" message="Something went wrong" />);
    
    // Assert
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    // Arrange
    const handleRetry = jest.fn();
    
    // Act
    renderWithTheme(<ErrorMessage message="Something went wrong" onRetry={handleRetry} />);
    
    // Assert
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    // Act - click the retry button
    fireEvent.click(retryButton);
    
    // Assert - check if the handler was called
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    // Arrange & Act
    renderWithTheme(<ErrorMessage message="Something went wrong" />);
    
    // Assert
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('renders with fullPage styling when fullPage is true', () => {
    // Arrange & Act
    const { container } = renderWithTheme(
      <ErrorMessage message="Something went wrong" fullPage={true} />
    );
    
    // Assert - check for fullPage specific styling
    // We can't directly test the styles, but we can check for the Paper component with elevation
    const paperElement = container.querySelector('.MuiPaper-elevation3');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders with regular styling when fullPage is false', () => {
    // Arrange & Act
    const { container } = renderWithTheme(
      <ErrorMessage message="Something went wrong" fullPage={false} />
    );
    
    // Assert - check for regular styling
    // We can't directly test the styles, but we can check for the Paper component with no elevation
    const paperElement = container.querySelector('.MuiPaper-elevation0');
    expect(paperElement).toBeInTheDocument();
  });
});
