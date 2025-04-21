import { SessionAnalysisService } from '../../services/sessionAnalysisService';
import { SessionAnalysisRepository } from '../../repositories/sessionAnalysisRepository';
import { TranscriptionRepository } from '../../repositories/transcriptionRepository';
import { SessionRepository } from '../../repositories/sessionRepository';
import { AudioRecordingRepository } from '../../repositories/audioRecordingRepository';
import { mockSessionAnalysis, mockTranscription, mockSession, mockAudioRecording } from '../mocks/mockData';

// Mock repositories
jest.mock('../../repositories/sessionAnalysisRepository');
jest.mock('../../repositories/transcriptionRepository');
jest.mock('../../repositories/sessionRepository');
jest.mock('../../repositories/audioRecordingRepository');

describe('SessionAnalysisService', () => {
  let sessionAnalysisService: SessionAnalysisService;
  let sessionAnalysisRepository: jest.Mocked<SessionAnalysisRepository>;
  let transcriptionRepository: jest.Mocked<TranscriptionRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let audioRecordingRepository: jest.Mocked<AudioRecordingRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock repositories
    sessionAnalysisRepository = new SessionAnalysisRepository() as jest.Mocked<SessionAnalysisRepository>;
    transcriptionRepository = new TranscriptionRepository() as jest.Mocked<TranscriptionRepository>;
    sessionRepository = new SessionRepository() as jest.Mocked<SessionRepository>;
    audioRecordingRepository = new AudioRecordingRepository() as jest.Mocked<AudioRecordingRepository>;

    // Create service with mock repositories
    sessionAnalysisService = new SessionAnalysisService(
      sessionAnalysisRepository,
      transcriptionRepository,
      sessionRepository,
      audioRecordingRepository
    );

    // Setup default mock implementations
    sessionAnalysisRepository.create.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisRepository.getById.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisRepository.getBySessionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisRepository.getByTranscriptionId.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisRepository.update.mockResolvedValue(mockSessionAnalysis);
    sessionAnalysisRepository.delete.mockResolvedValue(true);
    
    transcriptionRepository.getById.mockResolvedValue(mockTranscription);
    sessionRepository.getById.mockResolvedValue(mockSession);
    audioRecordingRepository.getById.mockResolvedValue(mockAudioRecording);
  });

  describe('createSessionAnalysis', () => {
    it('should create a new session analysis', async () => {
      // Arrange
      const sessionId = 'session-123';
      const transcriptionId = 'transcription-123';
      const userId = 'user-123';

      // Act
      const result = await sessionAnalysisService.createSessionAnalysis(sessionId, transcriptionId, userId);

      // Assert
      expect(sessionAnalysisRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: sessionId,
          transcription_id: transcriptionId,
          created_by: userId,
          status: 'pending'
        })
      );
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if session does not exist', async () => {
      // Arrange
      const sessionId = 'non-existent-session';
      const transcriptionId = 'transcription-123';
      const userId = 'user-123';
      
      sessionRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.createSessionAnalysis(sessionId, transcriptionId, userId)
      ).rejects.toThrow('Session not found');
    });

    it('should throw an error if transcription does not exist', async () => {
      // Arrange
      const sessionId = 'session-123';
      const transcriptionId = 'non-existent-transcription';
      const userId = 'user-123';
      
      transcriptionRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.createSessionAnalysis(sessionId, transcriptionId, userId)
      ).rejects.toThrow('Transcription not found');
    });
  });

  describe('getSessionAnalysisById', () => {
    it('should return session analysis by ID', async () => {
      // Arrange
      const analysisId = 'analysis-123';

      // Act
      const result = await sessionAnalysisService.getSessionAnalysisById(analysisId);

      // Assert
      expect(sessionAnalysisRepository.getById).toHaveBeenCalledWith(analysisId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if analysis does not exist', async () => {
      // Arrange
      const analysisId = 'non-existent-analysis';
      
      sessionAnalysisRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.getSessionAnalysisById(analysisId)
      ).rejects.toThrow('Session analysis not found');
    });
  });

  describe('getSessionAnalysisBySessionId', () => {
    it('should return session analysis by session ID', async () => {
      // Arrange
      const sessionId = 'session-123';

      // Act
      const result = await sessionAnalysisService.getSessionAnalysisBySessionId(sessionId);

      // Assert
      expect(sessionAnalysisRepository.getBySessionId).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if analysis does not exist for session', async () => {
      // Arrange
      const sessionId = 'session-without-analysis';
      
      sessionAnalysisRepository.getBySessionId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.getSessionAnalysisBySessionId(sessionId)
      ).rejects.toThrow('No analysis found for this session');
    });
  });

  describe('getSessionAnalysisByTranscriptionId', () => {
    it('should return session analysis by transcription ID', async () => {
      // Arrange
      const transcriptionId = 'transcription-123';

      // Act
      const result = await sessionAnalysisService.getSessionAnalysisByTranscriptionId(transcriptionId);

      // Assert
      expect(sessionAnalysisRepository.getByTranscriptionId).toHaveBeenCalledWith(transcriptionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if analysis does not exist for transcription', async () => {
      // Arrange
      const transcriptionId = 'transcription-without-analysis';
      
      sessionAnalysisRepository.getByTranscriptionId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.getSessionAnalysisByTranscriptionId(transcriptionId)
      ).rejects.toThrow('No analysis found for this transcription');
    });
  });

  describe('processSessionAnalysis', () => {
    it('should process session analysis', async () => {
      // Arrange
      const analysisId = 'analysis-123';
      const options = {
        include_sentiment_analysis: true,
        include_character_insights: true,
        include_plot_developments: true,
        include_topics: true,
        max_key_points: 10,
        max_topics: 5
      };

      // Mock the processing methods
      const processedAnalysis = {
        ...mockSessionAnalysis,
        status: 'completed',
        summary: 'This is a summary of the session.',
        key_points: [{ key_point_id: 'kp1', text: 'Key point 1', importance_score: 0.8 }],
        character_insights: [{ character_id: 'char1', name: 'Character 1', participation_score: 0.7 }],
        plot_developments: [{ plot_development_id: 'pd1', title: 'Plot development 1', importance_score: 0.9 }],
        sentiment_analysis: { overall_sentiment: 0.6 },
        topics: [{ topic_id: 'topic1', name: 'Topic 1', relevance_score: 0.8 }]
      };

      sessionAnalysisRepository.update.mockResolvedValue(processedAnalysis);

      // Act
      const result = await sessionAnalysisService.processSessionAnalysis(analysisId, options);

      // Assert
      expect(sessionAnalysisRepository.getById).toHaveBeenCalledWith(analysisId);
      expect(sessionAnalysisRepository.update).toHaveBeenCalled();
      expect(result).toEqual(processedAnalysis);
    });

    it('should throw an error if analysis does not exist', async () => {
      // Arrange
      const analysisId = 'non-existent-analysis';
      const options = {};
      
      sessionAnalysisRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.processSessionAnalysis(analysisId, options)
      ).rejects.toThrow('Session analysis not found');
    });
  });

  describe('deleteSessionAnalysis', () => {
    it('should delete session analysis', async () => {
      // Arrange
      const analysisId = 'analysis-123';

      // Act
      const result = await sessionAnalysisService.deleteSessionAnalysis(analysisId);

      // Assert
      expect(sessionAnalysisRepository.getById).toHaveBeenCalledWith(analysisId);
      expect(sessionAnalysisRepository.delete).toHaveBeenCalledWith(analysisId);
      expect(result).toBe(true);
    });

    it('should throw an error if analysis does not exist', async () => {
      // Arrange
      const analysisId = 'non-existent-analysis';
      
      sessionAnalysisRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionAnalysisService.deleteSessionAnalysis(analysisId)
      ).rejects.toThrow('Session analysis not found');
    });
  });
});
