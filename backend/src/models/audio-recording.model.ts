/**
 * Audio recording model
 */
export interface AudioRecording {
  recording_id: string;
  session_id: string;
  name: string;
  description?: string;
  file_path: string;
  duration_seconds: number;
  file_size_bytes: number;
  file_format: string;
  sample_rate: number;
  channels: number;
  bit_depth: number;
  created_at: string;
  created_by: string;
  transcription_status: TranscriptionStatus;
  transcription_id?: string;
}

/**
 * Audio recording creation parameters
 */
export interface AudioRecordingCreationParams {
  session_id: string;
  name: string;
  description?: string;
  file_path: string;
  duration_seconds: number;
  file_size_bytes: number;
  file_format: string;
  sample_rate: number;
  channels: number;
  bit_depth: number;
}

/**
 * Audio recording update parameters
 */
export interface AudioRecordingUpdateParams {
  name?: string;
  description?: string;
  transcription_status?: TranscriptionStatus;
  transcription_id?: string;
}

/**
 * Transcription status
 */
export enum TranscriptionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Audio recording settings
 */
export interface AudioRecordingSettings {
  sample_rate: number;
  channels: number;
  bit_depth: number;
  file_format: string;
  max_duration_minutes: number;
  auto_transcribe: boolean;
  transcription_service: TranscriptionService;
  enable_speaker_diarization: boolean;
  noise_reduction_level: NoiseReductionLevel;
}

/**
 * Transcription service
 */
export enum TranscriptionService {
  OPENAI_WHISPER = 'openai_whisper',
  VOSK = 'vosk',
  HYBRID = 'hybrid'
}

/**
 * Noise reduction level
 */
export enum NoiseReductionLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
