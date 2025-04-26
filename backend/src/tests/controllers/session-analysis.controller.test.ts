import { Request, Response } from 'express';
import { SessionAnalysisController } from '../../controllers/session-analysis.controller';
import { SessionAnalysisService } from '../../services/session-analysis.service';
import { 
  SessionAnalysis, 
  AnalysisProcessingOptions,
  KeyPointCategory,
  EntityType
} from '../../models/session-analysis.model';

// Mock service
jest.mock('../../services/session-analysis.service');

describe('SessionAnalysisController', () => {
  let sessionAnalysisController: SessionAnalysisController;
  let sessionAnalysisService: jest.Mocked<SessionAnalysisService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  // Mock data
  const mockUserId = 'user-123';
  const mockSessionId = 'session-123';
  const mockTranscriptionId = 'transcription-123';
  const mockRecordingId = 'recording-123';
  const mockAnalysisId = 'analysis-123';

  const mockSessionAnalysis: SessionAnalysis = {
    analysis_id: mockAnalysisId,
    session_id: mockSessionId,
    transcription_id: mockTranscriptionId,
    recording_id: mockRecordingId,
    created_by: mockUserId,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    status: 'pending'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock service
    sessionAnalysisService = {
      getById: jest.fn(),
      getSessionAnalysisById: jest.fn(),
      getBySessionId: jest.fn(),
      getSessionAnalysisBySessionId: jest.fn(),
      getByTranscriptionId: jest.fn(),
      getSessionAnalysisByTranscriptionId: jest.fn(),
      create: jest.fn(),
      createSessionAnalysis: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteSessionAnalysis: jest.fn(),
      process: jest.fn(),
      processSessionAnalysis: jest.fn()
    } as unknown as jest.Mocked<SessionAnalysisService>;

    // Create controller with mock service
    sessionAnalysisController = new SessionAnalysisController(sessionAnalysisService);

    // Create mock request and response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {
      params: {},
      body: {},
      user: { id: mockUserId }
    };
    res = {
      status: statusMock,
      json: jsonMock
    };

    // Set up default mock implementations
    sessionAnalysisService.getById.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getSessionAnalysisById.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getBySessionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getSessionAnalysisBySessionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getByTranscriptionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.getSessionAnalysisByTranscriptionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.create.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.createSessionAnalysis.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.update.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.delete.mockResolvedValue(true);
    sessionAnalysisService.deleteSessionAnalysis.mockResolvedValue(true);
    sessionAnalysisService.process.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisService.processSessionAnalysis.mockResolvedValue(mockSessionAnalysis);
  });

  describe('getById', () => {
    it('should get a session analysis by ID', async () => {
      req.params = { analysisId: mockAnalysisId };

      await sessionAnalysisController.getById(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if session analysis is not found', async () => {
      req.params = { analysisId: mockAnalysisId };
      sessionAnalysisService.getById.mockResolvedValue(null);

      await sessionAnalysisController.getById(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Session analysis not found.'
        }
      });
    });

    it('should handle errors', async () => {
      req.params = { analysisId: mockAnalysisId };
      sessionAnalysisService.getById.mockRejectedValue(new Error('Test error'));

      await sessionAnalysisController.getById(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the session analysis.'
        }
      });
    });
  });

  describe('getBySessionId', () => {
    it('should get a session analysis by session ID', async () => {
      req.params = { sessionId: mockSessionId };

      await sessionAnalysisController.getBySessionId(req as Request, res as Response);

      expect(sessionAnalysisService.getBySessionId).toHaveBeenCalledWith(mockSessionId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if session analysis is not found', async () => {
      req.params = { sessionId: mockSessionId };
      sessionAnalysisService.getBySessionId.mockResolvedValue(null);

      await sessionAnalysisController.getBySessionId(req as Request, res as Response);

      expect(sessionAnalysisService.getBySessionId).toHaveBeenCalledWith(mockSessionId);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Session analysis not found for this session.'
        }
      });
    });

    it('should handle errors', async () => {
      req.params = { sessionId: mockSessionId };
      sessionAnalysisService.getBySessionId.mockRejectedValue(new Error('Test error'));

      await sessionAnalysisController.getBySessionId(req as Request, res as Response);

      expect(sessionAnalysisService.getBySessionId).toHaveBeenCalledWith(mockSessionId);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the session analysis.'
        }
      });
    });
  });

  describe('getByTranscriptionId', () => {
    it('should get a session analysis by transcription ID', async () => {
      req.params = { transcriptionId: mockTranscriptionId };

      await sessionAnalysisController.getByTranscriptionId(req as Request, res as Response);

      expect(sessionAnalysisService.getByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 404 if session analysis is not found', async () => {
      req.params = { transcriptionId: mockTranscriptionId };
      sessionAnalysisService.getByTranscriptionId.mockResolvedValue(null);

      await sessionAnalysisController.getByTranscriptionId(req as Request, res as Response);

      expect(sessionAnalysisService.getByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Session analysis not found for this transcription.'
        }
      });
    });

    it('should handle errors', async () => {
      req.params = { transcriptionId: mockTranscriptionId };
      sessionAnalysisService.getByTranscriptionId.mockRejectedValue(new Error('Test error'));

      await sessionAnalysisController.getByTranscriptionId(req as Request, res as Response);

      expect(sessionAnalysisService.getByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the session analysis.'
        }
      });
    });
  });

  describe('create', () => {
    it('should create a session analysis', async () => {
      req.body = {
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId
      };

      await sessionAnalysisController.create(req as Request, res as Response);

      expect(sessionAnalysisService.create).toHaveBeenCalledWith({
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId
      });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 400 if validation fails', async () => {
      req.body = {
        // Missing required fields
      };

      await sessionAnalysisController.create(req as Request, res as Response);

      expect(sessionAnalysisService.create).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR'
        })
      }));
    });

    it('should handle errors', async () => {
      req.body = {
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId
      };
      sessionAnalysisService.create.mockRejectedValue(new Error('Test error'));

      await sessionAnalysisController.create(req as Request, res as Response);

      expect(sessionAnalysisService.create).toHaveBeenCalledWith({
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId
      });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating the session analysis.'
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete a session analysis', async () => {
      req.params = { analysisId: mockAnalysisId };

      await sessionAnalysisController.delete(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisService.delete).toHaveBeenCalledWith(mockAnalysisId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          deleted: true
        }
      });
    });

    it('should return 404 if session analysis is not found', async () => {
      req.params = { analysisId: mockAnalysisId };
      sessionAnalysisService.getById.mockResolvedValue(null);

      await sessionAnalysisController.delete(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisService.delete).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Session analysis not found.'
        }
      });
    });

    it('should handle errors', async () => {
      req.params = { analysisId: mockAnalysisId };
      sessionAnalysisService.delete.mockRejectedValue(new Error('Test error'));

      await sessionAnalysisController.delete(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisService.delete).toHaveBeenCalledWith(mockAnalysisId);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting the session analysis.'
        }
      });
    });
  });

  describe('process', () => {
    it('should process a session analysis', async () => {
      req.params = { analysisId: mockAnalysisId };
      req.body = {
        include_sentiment_analysis: true,
        include_character_insights: true,
        include_plot_developments: true,
        include_topics: true,
        max_key_points: 5,
        max_topics: 3
      };

      await sessionAnalysisController.process(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisService.process).toHaveBeenCalledWith(mockAnalysisId, req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSessionAnalysis
      });
    });

    it('should return 400 if validation fails', async () => {
      req.params = { analysisId: mockAnalysisId };
      req.body = {
        max_key_points: 'invalid' // Should be a number
      };

      await sessionAnalysisController.process(req as Request, res as Response);

      expect(sessionAnalysisService.getById).not.toHaveBeenCalled();
      expect(sessionAnalysisService.process).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR'
        })
      }));
    });

    it('should return 404 if session analysis is not found', async () => {
      req.params = { analysisId: mockAnalysisId };
      req.body = {
        include_sentiment_analysis: true
      };
      sessionAnalysisService.getById.mockResolvedValue(null);

      await sessionAnalysisController.process(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisService.process).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Session analysis not found.'
        }
      });
    });

    it('should handle errors', async () => {
      req.params = { analysisId: mockAnalysisId };
      req.body = {
        include_sentiment_analysis: true
      };
      sessionAnalysisService.process.mockRejectedValue(new Error('Test error'));

      await sessionAnalysisController.process(req as Request, res as Response);

      expect(sessionAnalysisService.getById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisService.process).toHaveBeenCalledWith(mockAnalysisId, req.body);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while processing the session analysis.'
        }
      });
    });
  });
});
