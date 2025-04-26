import { SessionAnalysisRepository } from '../repositories/session-analysis.repository';
import { TranscriptionRepository } from '../repositories/transcription.repository';
import { SessionRepository } from '../repositories/session.repository';
import { CharacterRepository } from '../repositories/character.repository';
import { AudioRecordingRepository } from '../repositories/audio-recording.repository';
import {
  SessionAnalysis,
  SessionAnalysisCreationParams,
  SessionAnalysisUpdateParams,
  AnalysisProcessingOptions,
  KeyPointCategory,
  EntityType
} from '../models/session-analysis.model';
import { Transcription, TranscriptionSegment } from '../models/transcription.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing session analyses
 */
export class SessionAnalysisService {
  private sessionAnalysisRepository: SessionAnalysisRepository;
  private transcriptionRepository: TranscriptionRepository;
  private sessionRepository: SessionRepository;
  private characterRepository: CharacterRepository;
  private audioRecordingRepository: AudioRecordingRepository;

  constructor(
    sessionAnalysisRepository: SessionAnalysisRepository,
    transcriptionRepository: TranscriptionRepository,
    sessionRepository: SessionRepository,
    characterRepository: CharacterRepository,
    audioRecordingRepository: AudioRecordingRepository
  ) {
    this.sessionAnalysisRepository = sessionAnalysisRepository;
    this.transcriptionRepository = transcriptionRepository;
    this.sessionRepository = sessionRepository;
    this.characterRepository = characterRepository;
    this.audioRecordingRepository = audioRecordingRepository;
  }

  /**
   * Create a new session analysis
   * @param sessionId Session ID
   * @param transcriptionId Transcription ID
   * @param userId User ID
   * @returns Created session analysis
   */
  async createSessionAnalysis(
    sessionId: string,
    transcriptionId: string,
    userId: string
  ): Promise<SessionAnalysis> {
    try {
      // Check if session exists
      // @ts-ignore - Repository interface mismatch
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if transcription exists
      const transcription = await this.transcriptionRepository.findById(transcriptionId);
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Get recording ID from transcription
      const recordingId = transcription.recording_id;

      // Create session analysis
      const sessionAnalysis: SessionAnalysis = {
        session_id: sessionId,
        transcription_id: transcriptionId,
        recording_id: recordingId,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending'
      };

      // Save session analysis
      return await this.sessionAnalysisRepository.create(sessionAnalysis);
    } catch (error) {
      console.error('Error creating session analysis:', error);
      throw error;
    }
  }

  /**
   * Get session analysis by ID
   * @param analysisId Analysis ID
   * @returns Session analysis
   */
  public async getById(analysisId: string): Promise<SessionAnalysis | null> {
    return this.sessionAnalysisRepository.findById(analysisId);
  }

  /**
   * Get session analysis by ID
   * @param analysisId Analysis ID
   * @returns Session analysis
   */
  async getSessionAnalysisById(analysisId: string): Promise<SessionAnalysis> {
    try {
      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisRepository.findById(analysisId);
      if (!sessionAnalysis) {
        throw new Error('Session analysis not found');
      }

      return sessionAnalysis;
    } catch (error) {
      console.error('Error getting session analysis:', error);
      throw error;
    }
  }

  /**
   * Get session analysis by session ID
   * @param sessionId Session ID
   * @returns Session analysis
   */
  public async getBySessionId(sessionId: string): Promise<SessionAnalysis | null> {
    return this.sessionAnalysisRepository.findBySessionId(sessionId);
  }

  /**
   * Get session analysis by session ID
   * @param sessionId Session ID
   * @returns Session analysis
   */
  async getSessionAnalysisBySessionId(sessionId: string): Promise<SessionAnalysis> {
    try {
      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisRepository.findBySessionId(sessionId);
      if (!sessionAnalysis) {
        throw new Error('No analysis found for this session');
      }

      return sessionAnalysis;
    } catch (error) {
      console.error('Error getting session analysis by session ID:', error);
      throw error;
    }
  }

  /**
   * Get session analysis by transcription ID
   * @param transcriptionId Transcription ID
   * @returns Session analysis
   */
  public async getByTranscriptionId(transcriptionId: string): Promise<SessionAnalysis | null> {
    return this.sessionAnalysisRepository.findByTranscriptionId(transcriptionId);
  }

  /**
   * Get session analysis by transcription ID
   * @param transcriptionId Transcription ID
   * @returns Session analysis
   */
  async getSessionAnalysisByTranscriptionId(transcriptionId: string): Promise<SessionAnalysis> {
    try {
      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisRepository.findByTranscriptionId(transcriptionId);
      if (!sessionAnalysis) {
        throw new Error('No analysis found for this transcription');
      }

      return sessionAnalysis;
    } catch (error) {
      console.error('Error getting session analysis by transcription ID:', error);
      throw error;
    }
  }

  /**
   * Create session analysis
   * @param params Session analysis creation parameters
   * @returns Created session analysis
   */
  public async create(params: SessionAnalysisCreationParams): Promise<SessionAnalysis> {
    // Check if session exists
    // @ts-ignore - Repository interface mismatch
    const session = await this.sessionRepository.findById(params.session_id);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if transcription exists
    const transcription = await this.transcriptionRepository.findById(params.transcription_id);
    if (!transcription) {
      throw new Error('Transcription not found');
    }

    // Check if analysis already exists for this transcription
    const existingAnalysis = await this.sessionAnalysisRepository.findByTranscriptionId(params.transcription_id);
    if (existingAnalysis) {
      return existingAnalysis;
    }

    return this.sessionAnalysisRepository.create(params);
  }

  /**
   * Update session analysis
   * @param analysisId Analysis ID
   * @param params Session analysis update parameters
   * @returns Updated session analysis
   */
  public async update(analysisId: string, params: SessionAnalysisUpdateParams): Promise<SessionAnalysis> {
    return this.sessionAnalysisRepository.update(analysisId, params);
  }

  /**
   * Delete session analysis
   * @param analysisId Analysis ID
   * @returns True if deleted
   */
  public async delete(analysisId: string): Promise<boolean> {
    return this.sessionAnalysisRepository.delete(analysisId);
  }

  /**
   * Delete session analysis
   * @param analysisId Analysis ID
   * @returns Success status
   */
  async deleteSessionAnalysis(analysisId: string): Promise<boolean> {
    try {
      // Check if session analysis exists
      const sessionAnalysis = await this.sessionAnalysisRepository.findById(analysisId);
      if (!sessionAnalysis) {
        throw new Error('Session analysis not found');
      }

      // Delete session analysis
      return await this.sessionAnalysisRepository.delete(analysisId);
    } catch (error) {
      console.error('Error deleting session analysis:', error);
      throw error;
    }
  }

  /**
   * Process session analysis
   * @param analysisId Analysis ID
   * @param options Analysis processing options
   * @returns Processed session analysis
   */
  public async process(
    analysisId: string,
    options: AnalysisProcessingOptions = {}
  ): Promise<SessionAnalysis> {
    try {
      // Get analysis
      const analysis = await this.sessionAnalysisRepository.findById(analysisId);
      if (!analysis) {
        throw new Error('Analysis not found');
      }

      // Get transcription
      const transcription = await this.transcriptionRepository.findById(analysis.transcription_id);
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Start processing timer
      const startTime = Date.now();

      // Process transcription
      const processedAnalysis = await this.processTranscription(transcription, options);

      // Calculate processing time
      const processingTime = (Date.now() - startTime) / 1000;

      // Update metadata
      processedAnalysis.metadata = {
        ...processedAnalysis.metadata,
        processing_time_seconds: processingTime,
        model_version: options.model || 'default',
        word_count: transcription.word_count,
        confidence_score: transcription.confidence_score
      };

      // Update analysis
      return this.sessionAnalysisRepository.update(analysisId, processedAnalysis);
    } catch (error) {
      console.error('Error processing session analysis:', error);
      throw error;
    }
  }

  /**
   * Process session analysis
   * @param analysisId Analysis ID
   * @param options Processing options
   * @returns Processed session analysis
   */
  async processSessionAnalysis(analysisId: string, options: any = {}): Promise<SessionAnalysis> {
    try {
      // Get session analysis
      const sessionAnalysis = await this.sessionAnalysisRepository.findById(analysisId);
      if (!sessionAnalysis) {
        throw new Error('Session analysis not found');
      }

      // Get transcription
      const transcription = await this.transcriptionRepository.findById(sessionAnalysis.transcription_id);
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Update status to processing
      sessionAnalysis.status = 'processing';
      sessionAnalysis.updated_at = new Date().toISOString();
      // @ts-ignore - Type mismatch
      await this.sessionAnalysisRepository.update(sessionAnalysis.analysis_id!, sessionAnalysis);

      try {
        // Process transcription to generate analysis
        // This would typically involve NLP processing, but for now we'll create mock data

        // Generate summary
        sessionAnalysis.summary = this.generateSummary(transcription.segments);

        // Extract key points
        if (options.include_key_points !== false) {
          sessionAnalysis.key_points = this.extractKeyPoints(transcription.segments, options.max_key_points || 10);
        }

        // Generate character insights
        if (options.include_character_insights !== false) {
          sessionAnalysis.character_insights = this.generateCharacterInsights(transcription);
        }

        // Extract plot developments
        if (options.include_plot_developments !== false) {
          sessionAnalysis.plot_developments = this.extractPlotDevelopments(transcription.segments);
        }

        // Analyze sentiment
        if (options.include_sentiment_analysis !== false) {
          sessionAnalysis.sentiment_analysis = this.analyzeSentiment(transcription.segments);
        }

        // Extract topics
        if (options.include_topics !== false) {
          sessionAnalysis.topics = this.extractTopics(transcription.segments, options.max_topics || 5);
        }

        // Add metadata
        sessionAnalysis.metadata = {
          model_version: 'GPT-4',
          processing_time_seconds: Math.random() * 10 + 5,
          word_count: transcription.word_count || 0,
          confidence_score: Math.random() * 0.3 + 0.7
        };

        // Update status to completed
        sessionAnalysis.status = 'completed';
        sessionAnalysis.updated_at = new Date().toISOString();

        // Save updated session analysis
        // @ts-ignore - Type mismatch
        return await this.sessionAnalysisRepository.update(sessionAnalysis.analysis_id!, sessionAnalysis);
      } catch (processingError) {
        console.error('Error processing session analysis:', processingError);

        // Update status to failed
        sessionAnalysis.status = 'failed';
        // @ts-ignore - Type mismatch
        sessionAnalysis.error = processingError instanceof Error ? processingError.message : String(processingError);
        sessionAnalysis.updated_at = new Date().toISOString();
        // @ts-ignore - Type mismatch
        await this.sessionAnalysisRepository.update(sessionAnalysis.analysis_id!, sessionAnalysis);

        throw processingError;
      }
    } catch (error) {
      console.error('Error processing session analysis:', error);
      throw error;
    }
  }

  /**
   * Process transcription
   * @param transcription Transcription
   * @param options Analysis processing options
   * @returns Session analysis update parameters
   */
  private async processTranscription(
    transcription: Transcription,
    options: AnalysisProcessingOptions
  ): Promise<SessionAnalysisUpdateParams> {
    // In a real implementation, this would use NLP and AI to analyze the transcription
    // For now, we'll create a simple mock implementation

    // Generate summary
    const summary = this.generateSummary(transcription.segments);

    // Extract key points
    const keyPoints = this.extractKeyPoints(transcription.segments, options.max_key_points || 5);

    // Generate character insights
    const characterInsights = this.generateCharacterInsights(transcription);

    // Extract plot developments
    const plotDevelopments = this.extractPlotDevelopments(transcription.segments);

    // Analyze sentiment
    const sentimentAnalysis = this.analyzeSentiment(transcription.segments);

    // Extract topics
    const topics = this.extractTopics(transcription.segments, options.max_topics || 5);

    return {
      summary,
      key_points: keyPoints,
      character_insights: characterInsights,
      plot_developments: plotDevelopments,
      sentiment_analysis: sentimentAnalysis,
      topics: topics
    };
  }

  /**
   * Generate summary
   * @param segments Transcription segments
   * @returns Summary
   */
  private generateSummary(segments: TranscriptionSegment[]): string {
    // In a real implementation, this would use NLP to generate a summary
    // For now, we'll create a simple mock implementation
    const fullText = segments.map(segment => segment.text).join(' ');
    const words = fullText.split(/\s+/).filter(Boolean);

    if (words.length <= 50) {
      return fullText;
    }

    // Simple extractive summary (first 50 words)
    return words.slice(0, 50).join(' ') + '...';
  }

  /**
   * Extract key points
   * @param segments Transcription segments
   * @param maxKeyPoints Maximum number of key points
   * @returns Key points
   */
  private extractKeyPoints(segments: TranscriptionSegment[], maxKeyPoints: number) {
    // In a real implementation, this would use NLP to extract key points
    // For now, we'll create a simple mock implementation
    const keyPoints = [];

    // Select segments with highest confidence scores
    const sortedSegments = [...segments].sort((a, b) => b.confidence_score - a.confidence_score);

    // Take top segments as key points
    for (let i = 0; i < Math.min(maxKeyPoints, sortedSegments.length); i++) {
      const segment = sortedSegments[i];

      // Assign random category (in a real implementation, this would be determined by content)
      const categories = Object.values(KeyPointCategory);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      keyPoints.push({
        key_point_id: uuidv4(),
        text: segment.text,
        segment_ids: [segment.segment_id],
        importance_score: 0.5 + Math.random() * 0.5, // Random score between 0.5 and 1.0
        category: randomCategory
      });
    }

    return keyPoints;
  }

  /**
   * Generate character insights
   * @param transcription Transcription
   * @returns Character insights
   */
  private generateCharacterInsights(transcription: Transcription) {
    // In a real implementation, this would analyze speaker patterns and dialogue
    // For now, we'll create a simple mock implementation
    const characterInsights = [];

    // Group segments by speaker
    const speakerSegments: Record<string, TranscriptionSegment[]> = {};

    for (const segment of transcription.segments) {
      if (segment.speaker_id && segment.speaker_name) {
        if (!speakerSegments[segment.speaker_id]) {
          speakerSegments[segment.speaker_id] = [];
        }

        speakerSegments[segment.speaker_id].push(segment);
      }
    }

    // Create insights for each speaker
    for (const [speakerId, segments] of Object.entries(speakerSegments)) {
      const speakerName = segments[0].speaker_name || 'Unknown Speaker';
      const participationScore = segments.length / transcription.segments.length;

      // Create notable quotes (segments with highest confidence)
      const sortedSegments = [...segments].sort((a, b) => b.confidence_score - a.confidence_score);
      const notableQuotes = sortedSegments.slice(0, 3).map(segment => ({
        text: segment.text,
        segment_id: segment.segment_id,
        start_time: segment.start_time,
        end_time: segment.end_time,
        importance_score: segment.confidence_score
      }));

      // Create character insight
      characterInsights.push({
        speaker_id: speakerId,
        name: speakerName,
        participation_score: participationScore,
        sentiment_score: 0.5 + Math.random() * 0.5, // Random score between 0.5 and 1.0
        topics_of_interest: ['topic1', 'topic2'], // Mock topics
        notable_quotes: notableQuotes,
        key_interactions: [] // Will be populated in a real implementation
      });
    }

    return characterInsights;
  }

  /**
   * Extract plot developments
   * @param segments Transcription segments
   * @returns Plot developments
   */
  private extractPlotDevelopments(segments: TranscriptionSegment[]) {
    // In a real implementation, this would use NLP to identify plot points
    // For now, we'll create a simple mock implementation
    const plotDevelopments = [];

    // Create a mock plot development
    plotDevelopments.push({
      plot_development_id: uuidv4(),
      title: 'Major Decision',
      description: 'The party decided to explore the mysterious cave.',
      segment_ids: segments.slice(0, 3).map(segment => segment.segment_id),
      importance_score: 0.8,
      related_entities: [
        {
          entity_id: uuidv4(),
          entity_type: EntityType.LOCATION,
          name: 'Mysterious Cave',
          relevance_score: 0.9
        }
      ]
    });

    // Create another mock plot development
    if (segments.length > 5) {
      plotDevelopments.push({
        plot_development_id: uuidv4(),
        title: 'Character Revelation',
        description: 'A character revealed their secret past.',
        segment_ids: segments.slice(3, 6).map(segment => segment.segment_id),
        importance_score: 0.7,
        related_entities: [
          {
            entity_id: uuidv4(),
            entity_type: EntityType.CHARACTER,
            name: segments[3].speaker_name || 'Unknown Character',
            relevance_score: 0.8
          }
        ]
      });
    }

    return plotDevelopments;
  }

  /**
   * Analyze sentiment
   * @param segments Transcription segments
   * @returns Sentiment analysis
   */
  private analyzeSentiment(segments: TranscriptionSegment[]) {
    // In a real implementation, this would use NLP to analyze sentiment
    // For now, we'll create a simple mock implementation

    // Generate random sentiment scores
    const sentimentScores = segments.map(() => Math.random());
    const overallSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;

    // Count distribution
    const positive = sentimentScores.filter(score => score > 0.66).length / sentimentScores.length;
    const neutral = sentimentScores.filter(score => score >= 0.33 && score <= 0.66).length / sentimentScores.length;
    const negative = sentimentScores.filter(score => score < 0.33).length / sentimentScores.length;

    // Create timeline points (one point every 5 segments)
    const timelinePoints = [];
    for (let i = 0; i < segments.length; i += 5) {
      const segmentsSlice = segments.slice(i, i + 5);
      if (segmentsSlice.length > 0) {
        const avgScore = sentimentScores.slice(i, i + 5).reduce((sum, score) => sum + score, 0) / segmentsSlice.length;
        timelinePoints.push({
          time: segmentsSlice[0].start_time,
          sentiment_score: avgScore,
          context: segmentsSlice[0].text.substring(0, 50) + '...'
        });
      }
    }

    return {
      overall_sentiment: overallSentiment,
      sentiment_distribution: {
        positive,
        neutral,
        negative
      },
      sentiment_timeline: timelinePoints
    };
  }

  /**
   * Extract topics
   * @param segments Transcription segments
   * @param maxTopics Maximum number of topics
   * @returns Topics
   */
  private extractTopics(segments: TranscriptionSegment[], maxTopics: number) {
    // In a real implementation, this would use NLP to extract topics
    // For now, we'll create a simple mock implementation
    const topics = [];

    // Create mock topics
    const mockTopics = [
      { name: 'Combat', keywords: ['fight', 'attack', 'sword', 'damage'] },
      { name: 'Exploration', keywords: ['search', 'find', 'discover', 'map'] },
      { name: 'Dialogue', keywords: ['talk', 'speak', 'conversation', 'discuss'] },
      { name: 'Magic', keywords: ['spell', 'cast', 'magic', 'arcane'] },
      { name: 'Quest', keywords: ['mission', 'task', 'quest', 'objective'] }
    ];

    // Select random topics
    const selectedTopics = mockTopics.sort(() => 0.5 - Math.random()).slice(0, maxTopics);

    // Create topic objects
    for (const topic of selectedTopics) {
      topics.push({
        topic_id: uuidv4(),
        name: topic.name,
        keywords: topic.keywords,
        relevance_score: 0.5 + Math.random() * 0.5, // Random score between 0.5 and 1.0
        segment_ids: segments.slice(0, 3).map(segment => segment.segment_id) // Mock segment IDs
      });
    }

    return topics;
  }
}
