import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoadingScreen from '../LoadingScreen';

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

describe('LoadingScreen', () => {
  it('renders with default message', () => {
    // Arrange & Act
    renderWithTheme(<LoadingScreen />);
    
    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    // Arrange & Act
    renderWithTheme(<LoadingScreen message="Please wait..." />);
    
    // Assert
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('does not render message when message is empty', () => {
    // Arrange & Act
    renderWithTheme(<LoadingScreen message="" />);
    
    // Assert
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('applies fullScreen styling when fullScreen is true', () => {
    // Arrange & Act
    const { container } = renderWithTheme(<LoadingScreen fullScreen={true} />);
    
    // Assert
    // We can't directly test the styles, but we can check if the Box component has the correct height style
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveStyle('height: 100vh');
  });

  it('applies custom height when provided', () => {
    // Arrange & Act
    const { container } = renderWithTheme(<LoadingScreen height={200} />);
    
    // Assert
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveStyle('height: 200px');
  });

  it('applies custom height as string when provided', () => {
    // Arrange & Act
    const { container } = renderWithTheme(<LoadingScreen height="50vh" />);
    
    // Assert
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveStyle('height: 50vh');
  });
});
