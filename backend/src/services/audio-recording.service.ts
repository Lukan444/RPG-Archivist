import { AudioRecordingRepository } from '../repositories/audio-recording.repository';
import { AudioRecording, AudioRecordingCreationParams, AudioRecordingUpdateParams, AudioRecordingSettings, TranscriptionService, TranscriptionStatus } from '../models/audio-recording.model';
import { TranscriptionRepository } from '../repositories/transcription.repository';
import { TranscriptionCreationParams } from '../models/transcription.model';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

/**
 * Audio recording service
 */
export class AudioRecordingService {
  private audioRecordingRepository: AudioRecordingRepository;
  private transcriptionRepository: TranscriptionRepository;
  private uploadDir: string;
  private defaultSettings: AudioRecordingSettings;

  constructor(
    audioRecordingRepository: AudioRecordingRepository,
    transcriptionRepository: TranscriptionRepository,
    uploadDir: string = path.join(process.cwd(), 'uploads', 'audio')
  ) {
    this.audioRecordingRepository = audioRecordingRepository;
    this.transcriptionRepository = transcriptionRepository;
    this.uploadDir = uploadDir;
    
    // Default settings
    this.defaultSettings = {
      sample_rate: 44100,
      channels: 2,
      bit_depth: 16,
      file_format: 'wav',
      max_duration_minutes: 180,
      auto_transcribe: true,
      transcription_service: TranscriptionService.HYBRID,
      enable_speaker_diarization: true,
      noise_reduction_level: 'medium'
    };

    // Ensure upload directory exists
    this.ensureUploadDirExists();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirExists(): Promise<void> {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        await mkdir(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
      throw error;
    }
  }

  /**
   * Get all audio recordings for a session
   * @param sessionId Session ID
   * @param page Page number
   * @param limit Number of items per page
   * @param sort Sort field
   * @param order Sort order
   * @returns Audio recordings and total count
   */
  public async getAllBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'created_at',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ recordings: AudioRecording[], total: number }> {
    return this.audioRecordingRepository.findAllBySession(sessionId, page, limit, sort, order);
  }

  /**
   * Get audio recording by ID
   * @param recordingId Recording ID
   * @returns Audio recording
   */
  public async getById(recordingId: string): Promise<AudioRecording | null> {
    return this.audioRecordingRepository.findById(recordingId);
  }

  /**
   * Create audio recording from file
   * @param sessionId Session ID
   * @param name Recording name
   * @param description Recording description
   * @param file File buffer
   * @param fileOriginalName Original file name
   * @param userId User ID
   * @param settings Audio recording settings
   * @returns Created audio recording
   */
  public async createFromFile(
    sessionId: string,
    name: string,
    description: string | undefined,
    file: Buffer,
    fileOriginalName: string,
    userId: string,
    settings?: Partial<AudioRecordingSettings>
  ): Promise<AudioRecording> {
    try {
      // Merge settings with defaults
      const mergedSettings = { ...this.defaultSettings, ...settings };

      // Generate unique file name
      const fileExtension = path.extname(fileOriginalName);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save file
      await writeFile(filePath, file);

      // Get file metadata (in a real implementation, you would use a library to get actual audio metadata)
      const fileSizeBytes = file.length;
      const durationSeconds = 0; // This would be extracted from the audio file

      // Create audio recording
      const params: AudioRecordingCreationParams = {
        session_id: sessionId,
        name: name,
        description: description,
        file_path: filePath,
        duration_seconds: durationSeconds,
        file_size_bytes: fileSizeBytes,
        file_format: mergedSettings.file_format,
        sample_rate: mergedSettings.sample_rate,
        channels: mergedSettings.channels,
        bit_depth: mergedSettings.bit_depth
      };

      const recording = await this.audioRecordingRepository.create(params, userId);

      // If auto-transcribe is enabled, start transcription process
      if (mergedSettings.auto_transcribe) {
        await this.startTranscription(recording.recording_id, userId, mergedSettings);
      }

      return recording;
    } catch (error) {
      console.error('Error creating audio recording from file:', error);
      throw error;
    }
  }

  /**
   * Update audio recording
   * @param recordingId Recording ID
   * @param params Audio recording update parameters
   * @returns Updated audio recording
   */
  public async update(recordingId: string, params: AudioRecordingUpdateParams): Promise<AudioRecording> {
    return this.audioRecordingRepository.update(recordingId, params);
  }

  /**
   * Delete audio recording
   * @param recordingId Recording ID
   * @returns True if deleted
   */
  public async delete(recordingId: string): Promise<boolean> {
    try {
      // Get recording to get file path
      const recording = await this.audioRecordingRepository.findById(recordingId);
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // Delete recording from database
      const deleted = await this.audioRecordingRepository.delete(recordingId);

      // Delete file if it exists
      if (deleted && recording.file_path && fs.existsSync(recording.file_path)) {
        await unlink(recording.file_path);
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting audio recording:', error);
      throw error;
    }
  }

  /**
   * Start transcription process
   * @param recordingId Recording ID
   * @param userId User ID
   * @param settings Audio recording settings
   * @returns Transcription ID
   */
  public async startTranscription(
    recordingId: string,
    userId: string,
    settings?: Partial<AudioRecordingSettings>
  ): Promise<string> {
    try {
      // Merge settings with defaults
      const mergedSettings = { ...this.defaultSettings, ...settings };

      // Get recording
      const recording = await this.audioRecordingRepository.findById(recordingId);
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // Check if transcription already exists
      if (recording.transcription_id) {
        const transcription = await this.transcriptionRepository.findById(recording.transcription_id);
        if (transcription) {
          return transcription.transcription_id;
        }
      }

      // Update recording status
      await this.audioRecordingRepository.update(recordingId, {
        transcription_status: TranscriptionStatus.IN_PROGRESS
      });

      // Create transcription
      const transcriptionParams: TranscriptionCreationParams = {
        recording_id: recordingId,
        session_id: recording.session_id,
        service_options: {
          service: mergedSettings.transcription_service,
          enable_speaker_diarization: mergedSettings.enable_speaker_diarization,
          additional_options: {
            noise_reduction_level: mergedSettings.noise_reduction_level
          }
        }
      };

      const transcription = await this.transcriptionRepository.create(transcriptionParams);

      // In a real implementation, you would start the transcription process asynchronously
      // For now, we'll just return the transcription ID
      return transcription.transcription_id;
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw error;
    }
  }

  /**
   * Get default audio recording settings
   * @returns Default audio recording settings
   */
  public getDefaultSettings(): AudioRecordingSettings {
    return { ...this.defaultSettings };
  }

  /**
   * Update default audio recording settings
   * @param settings Audio recording settings
   * @returns Updated default audio recording settings
   */
  public updateDefaultSettings(settings: Partial<AudioRecordingSettings>): AudioRecordingSettings {
    this.defaultSettings = { ...this.defaultSettings, ...settings };
    return { ...this.defaultSettings };
  }
}
