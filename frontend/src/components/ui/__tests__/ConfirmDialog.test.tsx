import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ConfirmDialog from '../ConfirmDialog';

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

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    // Arrange & Act
    renderWithTheme(<ConfirmDialog {...defaultProps} />);
    
    // Assert
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders with custom button text', () => {
    // Arrange & Act
    renderWithTheme(
      <ConfirmDialog 
        {...defaultProps} 
        confirmText="Yes, Do It" 
        cancelText="No, Go Back" 
      />
    );
    
    // Assert
    expect(screen.getByText('Yes, Do It')).toBeInTheDocument();
    expect(screen.getByText('No, Go Back')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    // Arrange
    renderWithTheme(<ConfirmDialog {...defaultProps} />);
    
    // Act
    fireEvent.click(screen.getByText('Confirm'));
    
    // Assert
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    // Arrange
    renderWithTheme(<ConfirmDialog {...defaultProps} />);
    
    // Act
    fireEvent.click(screen.getByText('Cancel'));
    
    // Assert
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when close icon is clicked', () => {
    // Arrange
    renderWithTheme(<ConfirmDialog {...defaultProps} />);
    
    // Act
    fireEvent.click(screen.getByLabelText('close'));
    
    // Assert
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('disables buttons when loading is true', () => {
    // Arrange & Act
    renderWithTheme(<ConfirmDialog {...defaultProps} loading={true} />);
    
    // Assert
    expect(screen.getByText('Confirm')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('applies custom confirm color', () => {
    // Arrange & Act
    renderWithTheme(<ConfirmDialog {...defaultProps} confirmColor="error" />);
    
    // Assert
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('MuiButton-colorError');
  });

  it('does not render when open is false', () => {
    // Arrange & Act
    renderWithTheme(<ConfirmDialog {...defaultProps} open={false} />);
    
    // Assert
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument();
  });
});
