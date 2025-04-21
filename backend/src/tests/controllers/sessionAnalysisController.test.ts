import { Request, Response } from 'express';
import { SessionAnalysisController } from '../../controllers/sessionAnalysisController';
import { SessionAnalysisService } from '../../services/sessionAnalysisService';
import { mockSessionAnalysis } from '../mocks/mockData';

// Mock service
jest.mock('../../services/sessionAnalysisService');

describe('SessionAnalysisController', () => {
  let sessionAnalysisController: SessionAnalysisController;
  let sessionAnalysisService: jest.Mocked<SessionAnalysisService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock service
    sessionAnalysisService = new SessionAnalysisService() as jest.Mocked<SessionAnalysisService>;

    // Create controller with mock service
    sessionAnalysisController = new SessionAnalysisController(sessionAnalysisService);

    // Setup mock request and response
    req = {
      params: {},
      body: {},
      user: { id: 'user-123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Setup default mock implementations
    sessionAnalysisService.createSessionAnalysis.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getSessionAnalysisById.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getSessionAnalysisBySessionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getSessionAnalysisByTranscriptionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.processSessionAnalysis.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.deleteSessionAnalysis.mockResolvedValue(true);
  });

  describe('createSessionAnalysis', () => {
    it('should create a new session analysis', async () => {
      // Arrange
      req.body = {
        session_id: 'session-123',
        transcription_id: 'transcription-123'
      };

      // Act
      await sessionAnalysisController.createSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.createSessionAnalysis).toHaveBeenCalledWith(
        'session-123',
        'transcription-123',
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 400 if session_id is missing', async () => {
      // Arrange
      req.body = {
        transcription_id: 'transcription-123'
      };

      // Act
      await sessionAnalysisController.createSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.createSessionAnalysis).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Session ID and transcription ID are required'
        }
      });
    });

    it('should return 400 if transcription_id is missing', async () => {
      // Arrange
      req.body = {
        session_id: 'session-123'
      };

      // Act
      await sessionAnalysisController.createSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.createSessionAnalysis).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Session ID and transcription ID are required'
        }
      });
    });

    it('should return 500 if service throws an error', async () => {
      // Arrange
      req.body = {
        session_id: 'session-123',
        transcription_id: 'transcription-123'
      };

      const error = new Error('Service error');
      sessionAnalysisService.createSessionAnalysis.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.createSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.createSessionAnalysis).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Failed to create session analysis',
          details: error.message
        }
      });
    });
  });

  describe('getSessionAnalysisById', () => {
    it('should return session analysis by ID', async () => {
      // Arrange
      req.params = {
        id: 'analysis-123'
      };

      // Act
      await sessionAnalysisController.getSessionAnalysisById(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisById).toHaveBeenCalledWith('analysis-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if analysis is not found', async () => {
      // Arrange
      req.params = {
        id: 'non-existent-analysis'
      };

      const error = new Error('Session analysis not found');
      sessionAnalysisService.getSessionAnalysisById.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.getSessionAnalysisById(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Session analysis not found'
        }
      });
    });

    it('should return 500 if service throws an error', async () => {
      // Arrange
      req.params = {
        id: 'analysis-123'
      };

      const error = new Error('Service error');
      sessionAnalysisService.getSessionAnalysisById.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.getSessionAnalysisById(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Failed to get session analysis',
          details: error.message
        }
      });
    });
  });

  describe('getSessionAnalysisBySessionId', () => {
    it('should return session analysis by session ID', async () => {
      // Arrange
      req.params = {
        sessionId: 'session-123'
      };

      // Act
      await sessionAnalysisController.getSessionAnalysisBySessionId(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisBySessionId).toHaveBeenCalledWith('session-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if analysis is not found for session', async () => {
      // Arrange
      req.params = {
        sessionId: 'session-without-analysis'
      };

      const error = new Error('No analysis found for this session');
      sessionAnalysisService.getSessionAnalysisBySessionId.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.getSessionAnalysisBySessionId(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisBySessionId).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'No analysis found for this session'
        }
      });
    });
  });

  describe('getSessionAnalysisByTranscriptionId', () => {
    it('should return session analysis by transcription ID', async () => {
      // Arrange
      req.params = {
        transcriptionId: 'transcription-123'
      };

      // Act
      await sessionAnalysisController.getSessionAnalysisByTranscriptionId(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisByTranscriptionId).toHaveBeenCalledWith('transcription-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if analysis is not found for transcription', async () => {
      // Arrange
      req.params = {
        transcriptionId: 'transcription-without-analysis'
      };

      const error = new Error('No analysis found for this transcription');
      sessionAnalysisService.getSessionAnalysisByTranscriptionId.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.getSessionAnalysisByTranscriptionId(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.getSessionAnalysisByTranscriptionId).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'No analysis found for this transcription'
        }
      });
    });
  });

  describe('processSessionAnalysis', () => {
    it('should process session analysis', async () => {
      // Arrange
      req.params = {
        id: 'analysis-123'
      };
      req.body = {
        include_sentiment_analysis: true,
        include_character_insights: true,
        include_plot_developments: true,
        include_topics: true,
        max_key_points: 10,
        max_topics: 5
      };

      // Act
      await sessionAnalysisController.processSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.processSessionAnalysis).toHaveBeenCalledWith(
        'analysis-123',
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if analysis is not found', async () => {
      // Arrange
      req.params = {
        id: 'non-existent-analysis'
      };

      const error = new Error('Session analysis not found');
      sessionAnalysisService.processSessionAnalysis.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.processSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.processSessionAnalysis).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Session analysis not found'
        }
      });
    });
  });

  describe('deleteSessionAnalysis', () => {
    it('should delete session analysis', async () => {
      // Arrange
      req.params = {
        id: 'analysis-123'
      };

      // Act
      await sessionAnalysisController.deleteSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.deleteSessionAnalysis).toHaveBeenCalledWith('analysis-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Session analysis deleted successfully'
        }
      });
    });

    it('should return 404 if analysis is not found', async () => {
      // Arrange
      req.params = {
        id: 'non-existent-analysis'
      };

      const error = new Error('Session analysis not found');
      sessionAnalysisService.deleteSessionAnalysis.mockRejectedValue(error);

      // Act
      await sessionAnalysisController.deleteSessionAnalysis(req as Request, res as Response);

      // Assert
      expect(sessionAnalysisService.deleteSessionAnalysis).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Session analysis not found'
        }
      });
    });
  });
});
