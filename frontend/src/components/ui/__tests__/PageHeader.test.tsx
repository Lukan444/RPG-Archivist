import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '@mui/material';
import PageHeader from '../PageHeader';

// Create a theme for testing
const theme = createTheme();

// Wrap component with ThemeProvider and BrowserRouter
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('PageHeader', () => {
  it('renders with title', () => {
    // Arrange & Act
    renderWithTheme(<PageHeader title="Test Title" />);
    
    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    // Arrange & Act
    renderWithTheme(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
    
    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders with breadcrumbs', () => {
    // Arrange
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Current Page' }
    ];
    
    // Act
    renderWithTheme(<PageHeader title="Test Title" breadcrumbs={breadcrumbs} />);
    
    // Assert
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
    
    // Check if links are rendered correctly
    const homeLink = screen.getByText('Home');
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    
    const categoryLink = screen.getByText('Category');
    expect(categoryLink.closest('a')).toHaveAttribute('href', '/category');
    
    // Current page should not be a link
    const currentPage = screen.getByText('Current Page');
    expect(currentPage.closest('a')).toBeNull();
  });

  it('renders with actions', () => {
    // Arrange & Act
    renderWithTheme(
      <PageHeader 
        title="Test Title" 
        actions={<Button>Test Action</Button>} 
      />
    );
    
    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('does not render breadcrumbs when not provided', () => {
    // Arrange & Act
    renderWithTheme(<PageHeader title="Test Title" />);
    
    // Assert
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    // Arrange & Act
    renderWithTheme(<PageHeader title="Test Title" />);
    
    // Assert
    // This is a bit tricky to test since we don't have a specific identifier for the subtitle
    // We can check that there's only one Typography element with the title text
    const titleElements = screen.getAllByText('Test Title');
    expect(titleElements.length).toBe(1);
  });

  it('does not render actions when not provided', () => {
    // Arrange & Act
    const { container } = renderWithTheme(<PageHeader title="Test Title" />);
    
    // Assert
    // We can't directly test for the absence of the actions container
    // But we can check that there's only one Box element (the main container)
    const boxElements = container.querySelectorAll('.MuiBox-root');
    expect(boxElements.length).toBe(2); // One for the main container and one for the title container
  });
});
