import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SessionAnalysisPage from '../SessionAnalysisPage';
import { sessionAnalysisService } from '../../services/sessionAnalysisService';
import { sessionService } from '../../services/sessionService';
import { transcriptionService } from '../../services/transcriptionService';

// Mock the services
jest.mock('../../services/sessionAnalysisService');
jest.mock('../../services/sessionService');
jest.mock('../../services/transcriptionService');

// Create a theme for testing
const theme = createTheme();

// Wrap component with ThemeProvider and Router
const renderWithThemeAndRouter = (ui: React.ReactElement, { route = '/sessions/123/analysis' } = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/sessions/:sessionId/analysis" element={ui} />
          <Route path="/sessions/:sessionId/analysis/:transcriptionId" element={ui} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('SessionAnalysisPage', () => {
  const mockSessionAnalysis = {
    analysis_id: 'analysis-123',
    session_id: 'session-123',
    transcription_id: 'transcription-123',
    recording_id: 'recording-123',
    status: 'completed',
    summary: 'This is a test summary of the session.',
    key_points: [
      {
        key_point_id: 'kp1',
        text: 'Key point 1',
        segment_ids: ['segment1'],
        importance_score: 0.8,
        category: 'discovery'
      }
    ],
    character_insights: [
      {
        character_id: 'char1',
        name: 'Character 1',
        participation_score: 0.7,
        sentiment_score: 0.6,
        topics_of_interest: ['magic', 'adventure'],
        notable_quotes: [],
        key_interactions: []
      }
    ],
    plot_developments: [
      {
        plot_development_id: 'pd1',
        title: 'Plot development 1',
        description: 'Description of plot development',
        segment_ids: ['segment1'],
        importance_score: 0.9,
        related_entities: []
      }
    ],
    sentiment_analysis: {
      overall_sentiment: 0.6,
      sentiment_distribution: {
        positive: 0.6,
        neutral: 0.3,
        negative: 0.1
      },
      sentiment_timeline: []
    },
    topics: [
      {
        topic_id: 'topic1',
        name: 'Topic 1',
        keywords: ['keyword1', 'keyword2'],
        relevance_score: 0.8,
        segment_ids: ['segment1']
      }
    ],
    metadata: {
      model_version: 'GPT-4',
      processing_time_seconds: 5.2,
      word_count: 120,
      confidence_score: 0.85
    },
    transcription: {
      segments: [
        {
          segment_id: 'segment1',
          start_time: 0,
          end_time: 10,
          text: 'This is a test segment',
          speaker_name: 'Speaker 1'
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service responses
    (sessionService.getById as jest.Mock).mockResolvedValue({
      success: true,
      data: { name: 'Test Session' }
    });
    
    (sessionAnalysisService.getBySessionId as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSessionAnalysis
    });
    
    (sessionAnalysisService.getByTranscriptionId as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSessionAnalysis
    });
    
    (sessionAnalysisService.create as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSessionAnalysis
    });
    
    (sessionAnalysisService.process as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSessionAnalysis
    });
    
    (transcriptionService.getById as jest.Mock).mockResolvedValue({
      success: true,
      data: { recording_id: 'recording-123' }
    });
  });

  it('renders the session analysis page with data', async () => {
    // Arrange & Act
    renderWithThemeAndRouter(<SessionAnalysisPage />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Session - Analysis')).toBeInTheDocument();
    });
    
    // Check tabs
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Key Points')).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Plot')).toBeInTheDocument();
    expect(screen.getByText('Sentiment')).toBeInTheDocument();
    expect(screen.getByText('Topics')).toBeInTheDocument();
    
    // Check summary content (default tab)
    expect(screen.getByText('This is a test summary of the session.')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    // Arrange
    renderWithThemeAndRouter(<SessionAnalysisPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Test Session - Analysis')).toBeInTheDocument();
    });
    
    // Act - click on Key Points tab
    fireEvent.click(screen.getByText('Key Points'));
    
    // Assert - check key points content
    expect(screen.getByText('Key point 1')).toBeInTheDocument();
    
    // Act - click on Characters tab
    fireEvent.click(screen.getByText('Characters'));
    
    // Assert - check characters content
    expect(screen.getByText('Character 1')).toBeInTheDocument();
    
    // Act - click on Plot tab
    fireEvent.click(screen.getByText('Plot'));
    
    // Assert - check plot content
    expect(screen.getByText('Plot development 1')).toBeInTheDocument();
  });

  it('creates a new analysis when none exists', async () => {
    // Arrange
    (sessionAnalysisService.getBySessionId as jest.Mock).mockRejectedValueOnce(new Error('No analysis found'));
    (sessionAnalysisService.getByTranscriptionId as jest.Mock).mockRejectedValueOnce(new Error('No analysis found'));
    
    // Act
    renderWithThemeAndRouter(<SessionAnalysisPage />, { route: '/sessions/123/analysis/456' });
    
    // Assert
    await waitFor(() => {
      expect(sessionAnalysisService.create).toHaveBeenCalledWith('123', '456');
    });
    
    await waitFor(() => {
      expect(sessionAnalysisService.process).toHaveBeenCalled();
    });
  });

  it('shows error message when analysis fails to load', async () => {
    // Arrange
    (sessionAnalysisService.getBySessionId as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    (sessionAnalysisService.getByTranscriptionId as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    (sessionAnalysisService.create as jest.Mock).mockRejectedValue(new Error('Failed to create'));
    
    // Act
    renderWithThemeAndRouter(<SessionAnalysisPage />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Failed to load session analysis. Please try again.')).toBeInTheDocument();
    });
  });

  it('refreshes analysis when refresh button is clicked', async () => {
    // Arrange
    renderWithThemeAndRouter(<SessionAnalysisPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Test Session - Analysis')).toBeInTheDocument();
    });
    
    // Act - click refresh button
    fireEvent.click(screen.getByText('Refresh'));
    
    // Assert
    await waitFor(() => {
      expect(sessionAnalysisService.process).toHaveBeenCalled();
    });
  });
});
