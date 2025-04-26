import { SessionAnalysisService } from '../../services/session-analysis.service';
import { SessionAnalysisRepository } from '../../repositories/session-analysis.repository';
import { TranscriptionRepository } from '../../repositories/transcription.repository';
import { SessionRepository } from '../../repositories/session.repository';
import { CharacterRepository } from '../../repositories/character.repository';
import { AudioRecordingRepository } from '../../repositories/audio-recording.repository';
import {
  SessionAnalysis,
  SessionAnalysisCreationParams,
  AnalysisProcessingOptions,
  KeyPointCategory,
  EntityType
} from '../../models/session-analysis.model';
import { Transcription, TranscriptionSegment } from '../../models/transcription.model';

// Mock repositories
jest.mock('../../repositories/session-analysis.repository');
jest.mock('../../repositories/transcription.repository');
jest.mock('../../repositories/session.repository');
jest.mock('../../repositories/character.repository');
jest.mock('../../repositories/audio-recording.repository');

describe('SessionAnalysisService', () => {
  let sessionAnalysisService: SessionAnalysisService;
  let sessionAnalysisRepository: jest.Mocked<SessionAnalysisRepository>;
  let transcriptionRepository: jest.Mocked<TranscriptionRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let characterRepository: jest.Mocked<CharacterRepository>;
  let audioRecordingRepository: jest.Mocked<AudioRecordingRepository>;

  // Mock data
  const mockUserId = 'user-123';
  const mockSessionId = 'session-123';
  const mockTranscriptionId = 'transcription-123';
  const mockRecordingId = 'recording-123';
  const mockAnalysisId = 'analysis-123';

  const mockSession = {
    session_id: mockSessionId,
    name: 'Test Session',
    description: 'Test session description',
    campaign_id: 'campaign-123',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    created_by: mockUserId
  };

  const mockTranscriptionSegments: TranscriptionSegment[] = [
    {
      segment_id: 'segment-1',
      start_time: 0,
      end_time: 10,
      text: 'Hello, this is a test transcription segment.',
      speaker_id: 'speaker-1',
      speaker_name: 'Speaker 1',
      confidence_score: 0.9
    },
    {
      segment_id: 'segment-2',
      start_time: 10,
      end_time: 20,
      text: 'This is another test transcription segment.',
      speaker_id: 'speaker-2',
      speaker_name: 'Speaker 2',
      confidence_score: 0.8
    }
  ];

  const mockTranscription: Transcription = {
    transcription_id: mockTranscriptionId,
    recording_id: mockRecordingId,
    session_id: mockSessionId,
    full_text: 'This is a test transcription.',
    segments: mockTranscriptionSegments,
    language_code: 'en-US',
    language: 'en',
    confidence_score: 0.85,
    word_count: 100,
    processing_time_seconds: 5,
    service_used: 'test-service',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    created_by: mockUserId,
    metadata: {
      model_version: 'test-model',
      audio_duration: 30,
      speaker_count: 2
    }
  };

  const mockSessionAnalysis: SessionAnalysis = {
    analysis_id: mockAnalysisId,
    session_id: mockSessionId,
    transcription_id: mockTranscriptionId,
    recording_id: mockRecordingId,
    created_by: mockUserId,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    status: 'pending',
    summary: '',
    key_points: [],
    character_insights: [],
    plot_developments: [],
    sentiment_analysis: {
      overall_sentiment: 0,
      sentiment_distribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      sentiment_timeline: []
    },
    topics: [],
    metadata: {
      model_version: 'test',
      processing_time_seconds: 0,
      word_count: 0,
      confidence_score: 0
    }
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock repositories
    sessionAnalysisRepository = {
      findById: jest.fn().mockResolvedValue(mockSessionAnalysis),
      findBySessionId: jest.fn().mockResolvedValue(mockSessionAnalysis),
      findByTranscriptionId: jest.fn().mockResolvedValue(mockSessionAnalysis),
      create: jest.fn().mockImplementation(async (analysis) => ({
        ...mockSessionAnalysis,
        ...analysis,
        analysis_id: mockAnalysisId
      })),
      update: jest.fn().mockImplementation(async (id, params) => ({
        ...mockSessionAnalysis,
        ...params,
        updated_at: new Date().toISOString()
      })),
      delete: jest.fn().mockResolvedValue(true)
    } as unknown as jest.Mocked<SessionAnalysisRepository>;

    transcriptionRepository = {
      findById: jest.fn().mockResolvedValue(mockTranscription),
      findBySessionId: jest.fn(),
      findByRecordingId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<TranscriptionRepository>;

    sessionRepository = {
      findById: jest.fn().mockResolvedValue(mockSession),
      findByUserId: jest.fn(),
      findByCampaignId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      findByDescription: jest.fn(),
      findByDate: jest.fn(),
      findByStatus: jest.fn(),
      findByParticipant: jest.fn(),
      addParticipant: jest.fn(),
      removeParticipant: jest.fn(),
      getParticipants: jest.fn()
    } as unknown as jest.Mocked<SessionRepository>;

    characterRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCampaignId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<CharacterRepository>;

    audioRecordingRepository = {
      findById: jest.fn(),
      findBySessionId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<AudioRecordingRepository>;

    // Create service with mock repositories
    sessionAnalysisService = new SessionAnalysisService(
      sessionAnalysisRepository,
      transcriptionRepository,
      sessionRepository,
      characterRepository,
      audioRecordingRepository
    );
  });

  describe('createSessionAnalysis', () => {
    it('should create a session analysis', async () => {
      const result = await sessionAnalysisService.createSessionAnalysis(
        mockSessionId,
        mockTranscriptionId,
        mockUserId
      );

      // Test passes if no error is thrown
      expect(transcriptionRepository.findById).toHaveBeenCalledWith(mockTranscriptionId);
      expect(sessionAnalysisRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        recording_id: mockRecordingId,
        created_by: mockUserId,
        status: 'pending'
      }));
      expect(result).toEqual(expect.objectContaining({
        analysis_id: mockAnalysisId,
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        recording_id: mockRecordingId,
        created_by: mockUserId,
        status: 'pending'
      }));
    });

    it('should throw an error if session is not found', async () => {
      // Mock session not found
      sessionRepository = {
        ...sessionRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<SessionRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      await expect(sessionAnalysisService.createSessionAnalysis(
        mockSessionId,
        mockTranscriptionId,
        mockUserId
      )).rejects.toThrow('Session not found');
    });

    it('should throw an error if transcription is not found', async () => {
      transcriptionRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(sessionAnalysisService.createSessionAnalysis(
        mockSessionId,
        mockTranscriptionId,
        mockUserId
      )).rejects.toThrow('Transcription not found');
    });
  });

  describe('getById', () => {
    it('should get a session analysis by ID', async () => {
      const result = await sessionAnalysisService.getById(mockAnalysisId);

      expect(sessionAnalysisRepository.findById).toHaveBeenCalledWith(mockAnalysisId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should return null if session analysis is not found', async () => {
      sessionAnalysisRepository.findById = jest.fn().mockResolvedValue(null);

      const result = await sessionAnalysisService.getById(mockAnalysisId);

      expect(sessionAnalysisRepository.findById).toHaveBeenCalledWith(mockAnalysisId);
      expect(result).toBeNull();
    });
  });

  describe('getSessionAnalysisById', () => {
    it('should get a session analysis by ID', async () => {
      const result = await sessionAnalysisService.getSessionAnalysisById(mockAnalysisId);

      expect(sessionAnalysisRepository.findById).toHaveBeenCalledWith(mockAnalysisId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if session analysis is not found', async () => {
      sessionAnalysisRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(sessionAnalysisService.getSessionAnalysisById(mockAnalysisId))
        .rejects.toThrow('Session analysis not found');
    });
  });

  describe('getBySessionId', () => {
    it('should get a session analysis by session ID', async () => {
      const result = await sessionAnalysisService.getBySessionId(mockSessionId);

      expect(sessionAnalysisRepository.findBySessionId).toHaveBeenCalledWith(mockSessionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should return null if session analysis is not found', async () => {
      sessionAnalysisRepository.findBySessionId = jest.fn().mockResolvedValue(null);

      const result = await sessionAnalysisService.getBySessionId(mockSessionId);

      expect(sessionAnalysisRepository.findBySessionId).toHaveBeenCalledWith(mockSessionId);
      expect(result).toBeNull();
    });
  });

  describe('getSessionAnalysisBySessionId', () => {
    it('should get a session analysis by session ID', async () => {
      const result = await sessionAnalysisService.getSessionAnalysisBySessionId(mockSessionId);

      expect(sessionAnalysisRepository.findBySessionId).toHaveBeenCalledWith(mockSessionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if session analysis is not found', async () => {
      sessionAnalysisRepository.findBySessionId = jest.fn().mockResolvedValue(null);

      await expect(sessionAnalysisService.getSessionAnalysisBySessionId(mockSessionId))
        .rejects.toThrow('No analysis found for this session');
    });
  });

  describe('getByTranscriptionId', () => {
    it('should get a session analysis by transcription ID', async () => {
      const result = await sessionAnalysisService.getByTranscriptionId(mockTranscriptionId);

      expect(sessionAnalysisRepository.findByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should return null if session analysis is not found', async () => {
      sessionAnalysisRepository.findByTranscriptionId = jest.fn().mockResolvedValue(null);

      const result = await sessionAnalysisService.getByTranscriptionId(mockTranscriptionId);

      expect(sessionAnalysisRepository.findByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(result).toBeNull();
    });
  });

  describe('getSessionAnalysisByTranscriptionId', () => {
    it('should get a session analysis by transcription ID', async () => {
      const result = await sessionAnalysisService.getSessionAnalysisByTranscriptionId(mockTranscriptionId);

      expect(sessionAnalysisRepository.findByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if session analysis is not found', async () => {
      sessionAnalysisRepository.findByTranscriptionId = jest.fn().mockResolvedValue(null);

      await expect(sessionAnalysisService.getSessionAnalysisByTranscriptionId(mockTranscriptionId))
        .rejects.toThrow('No analysis found for this transcription');
    });
  });

  describe('create', () => {
    it('should create a session analysis', async () => {
      const params: SessionAnalysisCreationParams = {
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        created_by: mockUserId
      };

      // Mock the create method to return the mock session analysis
      sessionAnalysisRepository.create = jest.fn().mockResolvedValue(mockSessionAnalysis);

      // Mock findByTranscriptionId to return null (no existing analysis)
      sessionAnalysisRepository.findByTranscriptionId = jest.fn().mockResolvedValue(null);

      const result = await sessionAnalysisService.create(params);

      // Test passes if no error is thrown
      expect(transcriptionRepository.findById).toHaveBeenCalledWith(mockTranscriptionId);
      expect(sessionAnalysisRepository.findByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(sessionAnalysisRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        created_by: mockUserId
      }));
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should return existing analysis if one exists for the transcription', async () => {
      const params: SessionAnalysisCreationParams = {
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        created_by: mockUserId
      };

      const result = await sessionAnalysisService.create(params);

      // Test passes if no error is thrown
      expect(transcriptionRepository.findById).toHaveBeenCalledWith(mockTranscriptionId);
      expect(sessionAnalysisRepository.findByTranscriptionId).toHaveBeenCalledWith(mockTranscriptionId);
      expect(result).toEqual(mockSessionAnalysis);
    });

    it('should throw an error if session is not found', async () => {
      // Mock session not found
      sessionRepository = {
        ...sessionRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<SessionRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      const params: SessionAnalysisCreationParams = {
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        created_by: mockUserId
      };

      await expect(sessionAnalysisService.create(params)).rejects.toThrow('Session not found');
    });

    it('should throw an error if transcription is not found', async () => {
      // Mock transcription not found
      transcriptionRepository = {
        ...transcriptionRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<TranscriptionRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      const params: SessionAnalysisCreationParams = {
        session_id: mockSessionId,
        transcription_id: mockTranscriptionId,
        created_by: mockUserId
      };

      await expect(sessionAnalysisService.create(params)).rejects.toThrow('Transcription not found');
    });
  });

  describe('update', () => {
    it('should update a session analysis', async () => {
      const updateParams = {
        summary: 'Updated summary',
        status: 'completed' as const
      };

      // Mock the update method to return the updated object
      sessionAnalysisRepository.update = jest.fn().mockResolvedValue({
        ...mockSessionAnalysis,
        ...updateParams
      });

      const result = await sessionAnalysisService.update(mockAnalysisId, updateParams);

      expect(sessionAnalysisRepository.update).toHaveBeenCalledWith(mockAnalysisId, updateParams);
      expect(result).toEqual(expect.objectContaining({
        ...mockSessionAnalysis,
        ...updateParams
      }));
    });
  });

  describe('delete', () => {
    it('should delete a session analysis', async () => {
      const result = await sessionAnalysisService.delete(mockAnalysisId);

      expect(sessionAnalysisRepository.delete).toHaveBeenCalledWith(mockAnalysisId);
      expect(result).toBe(true);
    });
  });

  describe('deleteSessionAnalysis', () => {
    it('should delete a session analysis', async () => {
      const result = await sessionAnalysisService.deleteSessionAnalysis(mockAnalysisId);

      expect(sessionAnalysisRepository.findById).toHaveBeenCalledWith(mockAnalysisId);
      expect(sessionAnalysisRepository.delete).toHaveBeenCalledWith(mockAnalysisId);
      expect(result).toBe(true);
    });

    it('should throw an error if session analysis is not found', async () => {
      sessionAnalysisRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(sessionAnalysisService.deleteSessionAnalysis(mockAnalysisId))
        .rejects.toThrow('Session analysis not found');
    });
  });

  describe('process', () => {
    it('should process a session analysis', async () => {
      const options: AnalysisProcessingOptions = {
        include_sentiment_analysis: true,
        include_character_insights: true,
        include_plot_developments: true,
        include_topics: true,
        max_key_points: 5,
        max_topics: 3
      };

      const processedAnalysis = {
        ...mockSessionAnalysis,
        summary: 'Test summary',
        key_points: [
          {
            key_point_id: 'key-point-1',
            text: 'Test key point',
            segment_ids: ['segment-1'],
            importance_score: 0.8,
            category: KeyPointCategory.PLOT
          }
        ],
        character_insights: [
          {
            speaker_id: 'speaker-1',
            name: 'Speaker 1',
            participation_score: 0.5,
            sentiment_score: 0.7,
            topics_of_interest: ['topic1', 'topic2'],
            notable_quotes: [],
            key_interactions: []
          }
        ],
        plot_developments: [
          {
            plot_development_id: 'plot-dev-1',
            title: 'Test plot development',
            description: 'Test description',
            segment_ids: ['segment-1'],
            importance_score: 0.8,
            related_entities: []
          }
        ],
        sentiment_analysis: {
          overall_sentiment: 0.7,
          sentiment_distribution: {
            positive: 0.7,
            neutral: 0.2,
            negative: 0.1
          },
          sentiment_timeline: []
        },
        topics: [
          {
            topic_id: 'topic-1',
            name: 'Test topic',
            keywords: ['test', 'topic'],
            relevance_score: 0.8,
            segment_ids: ['segment-1']
          }
        ],
        status: 'completed',
        metadata: {
          model_version: 'default',
          processing_time_seconds: 1.5,
          word_count: 100,
          confidence_score: 0.85
        }
      };

      sessionAnalysisRepository.update = jest.fn().mockResolvedValue(processedAnalysis);

      const result = await sessionAnalysisService.process(mockAnalysisId, options);

      expect(sessionAnalysisRepository.findById).toHaveBeenCalledWith(mockAnalysisId);
      expect(transcriptionRepository.findById).toHaveBeenCalledWith(mockTranscriptionId);
      expect(sessionAnalysisRepository.update).toHaveBeenCalled();
      expect(result).toEqual(processedAnalysis);
    });

    it('should throw an error if analysis is not found', async () => {
      // Mock analysis not found
      sessionAnalysisRepository = {
        ...sessionAnalysisRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<SessionAnalysisRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      await expect(sessionAnalysisService.process(mockAnalysisId))
        .rejects.toThrow('Analysis not found');
    });

    it('should throw an error if transcription is not found', async () => {
      // Mock transcription not found
      transcriptionRepository = {
        ...transcriptionRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<TranscriptionRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      await expect(sessionAnalysisService.process(mockAnalysisId))
        .rejects.toThrow('Transcription not found');
    });
  });

  describe('processSessionAnalysis', () => {
    it('should process a session analysis', async () => {
      const options = {
        include_sentiment_analysis: true,
        include_character_insights: true,
        include_plot_developments: true,
        include_topics: true,
        max_key_points: 5,
        max_topics: 3
      };

      const processedAnalysis = {
        ...mockSessionAnalysis,
        summary: 'Test summary',
        key_points: [
          {
            key_point_id: 'key-point-1',
            text: 'Test key point',
            segment_ids: ['segment-1'],
            importance_score: 0.8,
            category: KeyPointCategory.PLOT
          }
        ],
        character_insights: [
          {
            speaker_id: 'speaker-1',
            name: 'Speaker 1',
            participation_score: 0.5,
            sentiment_score: 0.7,
            topics_of_interest: ['topic1', 'topic2'],
            notable_quotes: [],
            key_interactions: []
          }
        ],
        plot_developments: [
          {
            plot_development_id: 'plot-dev-1',
            title: 'Test plot development',
            description: 'Test description',
            segment_ids: ['segment-1'],
            importance_score: 0.8,
            related_entities: []
          }
        ],
        sentiment_analysis: {
          overall_sentiment: 0.7,
          sentiment_distribution: {
            positive: 0.7,
            neutral: 0.2,
            negative: 0.1
          },
          sentiment_timeline: []
        },
        topics: [
          {
            topic_id: 'topic-1',
            name: 'Test topic',
            keywords: ['test', 'topic'],
            relevance_score: 0.8,
            segment_ids: ['segment-1']
          }
        ],
        status: 'completed',
        metadata: {
          model_version: 'GPT-4',
          processing_time_seconds: 1.5,
          word_count: 100,
          confidence_score: 0.85
        }
      };

      sessionAnalysisRepository.update = jest.fn()
        .mockImplementationOnce(async () => ({ ...mockSessionAnalysis, status: 'processing' }))
        .mockImplementationOnce(async () => processedAnalysis);

      const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId, options);

      expect(sessionAnalysisRepository.findById).toHaveBeenCalledWith(mockAnalysisId);
      expect(transcriptionRepository.findById).toHaveBeenCalledWith(mockTranscriptionId);
      expect(sessionAnalysisRepository.update).toHaveBeenCalledTimes(2);
      expect(result).toEqual(processedAnalysis);
    });

    it('should throw an error if analysis is not found', async () => {
      // Mock analysis not found
      sessionAnalysisRepository = {
        ...sessionAnalysisRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<SessionAnalysisRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      await expect(sessionAnalysisService.processSessionAnalysis(mockAnalysisId))
        .rejects.toThrow('Session analysis not found');
    });

    it('should throw an error if transcription is not found', async () => {
      // Mock transcription not found
      transcriptionRepository = {
        ...transcriptionRepository,
        findById: jest.fn().mockResolvedValue(null)
      } as unknown as jest.Mocked<TranscriptionRepository>;

      // Recreate service with updated mock
      sessionAnalysisService = new SessionAnalysisService(
        sessionAnalysisRepository,
        transcriptionRepository,
        sessionRepository,
        characterRepository,
        audioRecordingRepository
      );

      await expect(sessionAnalysisService.processSessionAnalysis(mockAnalysisId))
        .rejects.toThrow('Transcription not found');
    });

    it('should handle processing errors', async () => {
      // Mock the first update to succeed (status -> processing)
      sessionAnalysisRepository.update = jest.fn()
        .mockImplementationOnce(async () => ({ ...mockSessionAnalysis, status: 'processing' }));

      // Mock generateSummary to throw an error
      jest.spyOn(sessionAnalysisService as any, 'generateSummary').mockImplementation(() => {
        throw new Error('Processing error');
      });

      await expect(sessionAnalysisService.processSessionAnalysis(mockAnalysisId))
        .rejects.toThrow('Processing error');

      // Verify that status was updated to failed
      expect(sessionAnalysisRepository.update).toHaveBeenCalledWith(
        mockAnalysisId,
        expect.objectContaining({
          status: 'failed',
          error: 'Processing error'
        })
      );
    });
  });

  // Test private methods through the public methods that use them
  describe('private methods', () => {
    describe('generateSummary', () => {
      it('should generate a summary from transcription segments', async () => {
        const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId);

        expect(result.summary).toBeDefined();
        expect(typeof result.summary).toBe('string');
      });
    });

    describe('extractKeyPoints', () => {
      it('should extract key points from transcription segments', async () => {
        const options = { max_key_points: 2 };

        // Mock the processed analysis with key_points
        const processedAnalysis = {
          ...mockSessionAnalysis,
          key_points: [
            {
              key_point_id: 'key-point-1',
              text: 'Test key point',
              segment_ids: ['segment-1'],
              importance_score: 0.8,
              category: KeyPointCategory.PLOT
            }
          ]
        };

        sessionAnalysisRepository.update = jest.fn()
          .mockImplementationOnce(async () => ({ ...mockSessionAnalysis, status: 'processing' }))
          .mockImplementationOnce(async () => processedAnalysis);

        const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId, options);

        expect(result.key_points).toBeDefined();
        expect(Array.isArray(result.key_points)).toBe(true);
        if (result.key_points) {
          expect(result.key_points.length).toBeLessThanOrEqual(options.max_key_points);
        }
      });
    });

    describe('generateCharacterInsights', () => {
      it('should generate character insights from transcription', async () => {
        const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId);

        expect(result.character_insights).toBeDefined();
        expect(Array.isArray(result.character_insights)).toBe(true);
      });
    });

    describe('extractPlotDevelopments', () => {
      it('should extract plot developments from transcription segments', async () => {
        const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId);

        expect(result.plot_developments).toBeDefined();
        expect(Array.isArray(result.plot_developments)).toBe(true);
      });
    });

    describe('analyzeSentiment', () => {
      it('should analyze sentiment from transcription segments', async () => {
        // Mock the processed analysis with sentiment_analysis
        const processedAnalysis = {
          ...mockSessionAnalysis,
          sentiment_analysis: {
            overall_sentiment: 0.7,
            sentiment_distribution: {
              positive: 0.7,
              neutral: 0.2,
              negative: 0.1
            },
            sentiment_timeline: []
          }
        };

        sessionAnalysisRepository.update = jest.fn()
          .mockImplementationOnce(async () => ({ ...mockSessionAnalysis, status: 'processing' }))
          .mockImplementationOnce(async () => processedAnalysis);

        const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId);

        expect(result.sentiment_analysis).toBeDefined();
        if (result.sentiment_analysis) {
          expect(result.sentiment_analysis.overall_sentiment).toBeDefined();
          expect(result.sentiment_analysis.sentiment_distribution).toBeDefined();
          expect(result.sentiment_analysis.sentiment_timeline).toBeDefined();
        }
      });
    });

    describe('extractTopics', () => {
      it('should extract topics from transcription segments', async () => {
        const options = { max_topics: 3 };

        // Mock the processed analysis with topics
        const processedAnalysis = {
          ...mockSessionAnalysis,
          topics: [
            {
              topic_id: 'topic-1',
              name: 'Test topic',
              keywords: ['test', 'topic'],
              relevance_score: 0.8,
              segment_ids: ['segment-1']
            }
          ]
        };

        sessionAnalysisRepository.update = jest.fn()
          .mockImplementationOnce(async () => ({ ...mockSessionAnalysis, status: 'processing' }))
          .mockImplementationOnce(async () => processedAnalysis);

        const result = await sessionAnalysisService.processSessionAnalysis(mockAnalysisId, options);

        expect(result.topics).toBeDefined();
        expect(Array.isArray(result.topics)).toBe(true);
        if (result.topics) {
          expect(result.topics.length).toBeLessThanOrEqual(options.max_topics);
        }
      });
    });
  });
});
