/**
 * Session analysis model
 */
export interface SessionAnalysis {
  analysis_id?: string;
  session_id: string;
  transcription_id: string;
  recording_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  key_points?: KeyPoint[];
  character_insights?: CharacterInsight[];
  plot_developments?: PlotDevelopment[];
  sentiment_analysis?: SentimentAnalysis;
  topics?: Topic[];
  metadata?: AnalysisMetadata;
  error?: string;
  transcription?: any;
}

/**
 * Key point in the session
 */
export interface KeyPoint {
  key_point_id: string;
  text: string;
  segment_ids: string[];
  importance_score: number;
  category: KeyPointCategory;
}

/**
 * Key point category
 */
export enum KeyPointCategory {
  DECISION = 'decision',
  DISCOVERY = 'discovery',
  COMBAT = 'combat',
  INTERACTION = 'interaction',
  QUEST = 'quest',
  LORE = 'lore',
  PLOT = 'plot', // Added for compatibility
  OTHER = 'other'
}

/**
 * Character insight
 */
export interface CharacterInsight {
  character_id?: string;
  speaker_id?: string;
  name: string;
  participation_score: number;
  sentiment_score: number;
  key_interactions: CharacterInteraction[];
  topics_of_interest: string[];
  notable_quotes: NotableQuote[];
}

/**
 * Character interaction
 */
export interface CharacterInteraction {
  character_id?: string;
  speaker_id?: string;
  name: string;
  interaction_count: number;
  sentiment_score: number;
  context: string;
}

/**
 * Notable quote
 */
export interface NotableQuote {
  text: string;
  segment_id: string;
  start_time: number;
  end_time: number;
  importance_score: number;
}

/**
 * Plot development
 */
export interface PlotDevelopment {
  plot_development_id: string;
  title: string;
  description: string;
  segment_ids: string[];
  importance_score: number;
  related_entities: RelatedEntity[];
}

/**
 * Related entity
 */
export interface RelatedEntity {
  entity_id: string;
  entity_type: EntityType;
  name: string;
  relevance_score: number;
}

/**
 * Entity type
 */
export enum EntityType {
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  EVENT = 'event',
  OTHER = 'other'
}

/**
 * Sentiment analysis
 */
export interface SentimentAnalysis {
  overall_sentiment: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentiment_timeline: SentimentTimelinePoint[];
}

/**
 * Sentiment timeline point
 */
export interface SentimentTimelinePoint {
  time: number;
  sentiment_score: number;
  context: string;
}

/**
 * Topic
 */
export interface Topic {
  topic_id: string;
  name: string;
  keywords: string[];
  relevance_score: number;
  segment_ids: string[];
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  model_version: string;
  processing_time_seconds: number;
  word_count: number;
  confidence_score: number;
  additional_info?: Record<string, any>;
}

/**
 * Session analysis creation parameters
 */
export interface SessionAnalysisCreationParams {
  session_id: string;
  transcription_id: string;
  created_by: string;
}

/**
 * Session analysis update parameters
 */
export type SessionAnalysisUpdateParams = Partial<Omit<SessionAnalysis, 'analysis_id' | 'session_id' | 'transcription_id' | 'created_at' | 'created_by'>>;


/**
 * Analysis processing options
 */
export interface AnalysisProcessingOptions {
  include_sentiment_analysis?: boolean;
  include_character_insights?: boolean;
  include_plot_developments?: boolean;
  include_topics?: boolean;
  model?: string;
  max_key_points?: number;
  max_topics?: number;
  min_relevance_score?: number;
  additional_options?: Record<string, any>;
}
