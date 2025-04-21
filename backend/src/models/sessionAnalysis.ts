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
 * Key point model
 */
export interface KeyPoint {
  key_point_id: string;
  text: string;
  segment_ids: string[];
  importance_score: number;
  category: string;
}

/**
 * Character insight model
 */
export interface CharacterInsight {
  character_id?: string;
  speaker_id?: string;
  name: string;
  participation_score: number;
  sentiment_score: number;
  topics_of_interest: string[];
  notable_quotes: NotableQuote[];
  key_interactions: CharacterInteraction[];
}

/**
 * Notable quote model
 */
export interface NotableQuote {
  text: string;
  segment_id: string;
  start_time: number;
  end_time: number;
  importance_score: number;
}

/**
 * Character interaction model
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
 * Plot development model
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
 * Related entity model
 */
export interface RelatedEntity {
  entity_id: string;
  entity_type: string;
  name: string;
  relevance_score: number;
}

/**
 * Sentiment analysis model
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
 * Sentiment timeline point model
 */
export interface SentimentTimelinePoint {
  time: number;
  sentiment_score: number;
  context: string;
}

/**
 * Topic model
 */
export interface Topic {
  topic_id: string;
  name: string;
  keywords: string[];
  relevance_score: number;
  segment_ids: string[];
}

/**
 * Analysis metadata model
 */
export interface AnalysisMetadata {
  model_version: string;
  processing_time_seconds: number;
  word_count: number;
  confidence_score: number;
  additional_info?: Record<string, any>;
}
