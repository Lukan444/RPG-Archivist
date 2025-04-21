/**
 * Transcription model
 */
export interface Transcription {
  transcription_id: string;
  recording_id: string;
  session_id: string;
  full_text: string;
  segments: TranscriptionSegment[];
  language_code: string;
  confidence_score: number;
  word_count: number;
  processing_time_seconds: number;
  service_used: string;
  created_at: string;
  updated_at: string;
  metadata: TranscriptionMetadata;
}

/**
 * Transcription segment
 */
export interface TranscriptionSegment {
  segment_id: string;
  start_time: number;
  end_time: number;
  text: string;
  speaker_id?: string;
  speaker_name?: string;
  confidence_score: number;
  words?: TranscriptionWord[];
}

/**
 * Transcription word
 */
export interface TranscriptionWord {
  word: string;
  start_time: number;
  end_time: number;
  confidence_score: number;
}

/**
 * Transcription metadata
 */
export interface TranscriptionMetadata {
  model_version: string;
  audio_duration: number;
  speaker_count?: number;
  noise_level?: number;
  additional_info?: Record<string, any>;
}

/**
 * Transcription creation parameters
 */
export interface TranscriptionCreationParams {
  recording_id: string;
  session_id: string;
  service_options: TranscriptionServiceOptions;
}

/**
 * Transcription service options
 */
export interface TranscriptionServiceOptions {
  service: string;
  model?: string;
  language?: string;
  enable_speaker_diarization?: boolean;
  speaker_count?: number;
  timestamp_granularity?: TimestampGranularity;
  additional_options?: Record<string, any>;
}

/**
 * Timestamp granularity
 */
export enum TimestampGranularity {
  SEGMENT = 'segment',
  WORD = 'word'
}

/**
 * Transcription update parameters
 */
export interface TranscriptionUpdateParams {
  full_text?: string;
  segments?: TranscriptionSegment[];
  language_code?: string;
  confidence_score?: number;
  metadata?: Partial<TranscriptionMetadata>;
}

/**
 * Speaker identification
 */
export interface SpeakerIdentification {
  speaker_id: string;
  speaker_name: string;
  character_id?: string;
  user_id?: string;
  confidence_score: number;
}

/**
 * Speaker identification update parameters
 */
export interface SpeakerIdentificationUpdateParams {
  speaker_name?: string;
  character_id?: string;
  user_id?: string;
}
