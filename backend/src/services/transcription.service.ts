import { TranscriptionRepository } from '../repositories/transcription.repository';
import { AudioRecordingRepository } from '../repositories/audio-recording.repository';
import { Transcription, TranscriptionSegment, TranscriptionUpdateParams, SpeakerIdentification, SpeakerIdentificationUpdateParams } from '../models/transcription.model';
import { TranscriptionStatus } from '../models/audio-recording.model';
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

/**
 * Transcription service
 */
export class TranscriptionService {
  private transcriptionRepository: TranscriptionRepository;
  private audioRecordingRepository: AudioRecordingRepository;

  constructor(
    transcriptionRepository: TranscriptionRepository,
    audioRecordingRepository: AudioRecordingRepository
  ) {
    this.transcriptionRepository = transcriptionRepository;
    this.audioRecordingRepository = audioRecordingRepository;
  }

  /**
   * Get transcription by ID
   * @param transcriptionId Transcription ID
   * @returns Transcription
   */
  public async getById(transcriptionId: string): Promise<Transcription | null> {
    return this.transcriptionRepository.findById(transcriptionId);
  }

  /**
   * Get transcription by recording ID
   * @param recordingId Recording ID
   * @returns Transcription
   */
  public async getByRecordingId(recordingId: string): Promise<Transcription | null> {
    return this.transcriptionRepository.findByRecordingId(recordingId);
  }

  /**
   * Update transcription
   * @param transcriptionId Transcription ID
   * @param params Transcription update parameters
   * @returns Updated transcription
   */
  public async update(transcriptionId: string, params: TranscriptionUpdateParams): Promise<Transcription> {
    const transcription = await this.transcriptionRepository.update(transcriptionId, params);

    // If the transcription has segments, update the recording status to completed
    if (transcription.segments && transcription.segments.length > 0) {
      await this.audioRecordingRepository.update(transcription.recording_id, {
        transcription_status: TranscriptionStatus.COMPLETED
      });
    }

    return transcription;
  }

  /**
   * Delete transcription
   * @param transcriptionId Transcription ID
   * @returns True if deleted
   */
  public async delete(transcriptionId: string): Promise<boolean> {
    return this.transcriptionRepository.delete(transcriptionId);
  }

  /**
   * Process transcription with OpenAI Whisper
   * @param transcriptionId Transcription ID
   * @param enableSpeakerDiarization Enable speaker diarization
   * @returns Updated transcription
   */
  public async processWithWhisper(
    transcriptionId: string,
    enableSpeakerDiarization: boolean = true
  ): Promise<Transcription> {
    try {
      // Get transcription
      const transcription = await this.transcriptionRepository.findById(transcriptionId);
      
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Get recording
      const recording = await this.audioRecordingRepository.findById(transcription.recording_id);
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // Read audio file
      const audioFile = await readFile(recording.file_path);

      // In a real implementation, you would call the OpenAI Whisper API here
      // For now, we'll just simulate the process with a mock response

      // Mock processing time
      const processingTimeSeconds = 5;

      // Mock transcription result
      const mockSegments: TranscriptionSegment[] = [
        {
          segment_id: '1',
          start_time: 0,
          end_time: 5,
          text: 'Hello, this is a test transcription.',
          confidence_score: 0.95,
          speaker_id: enableSpeakerDiarization ? 'speaker1' : undefined,
          speaker_name: enableSpeakerDiarization ? 'Speaker 1' : undefined
        },
        {
          segment_id: '2',
          start_time: 5,
          end_time: 10,
          text: 'This is another segment of the transcription.',
          confidence_score: 0.92,
          speaker_id: enableSpeakerDiarization ? 'speaker2' : undefined,
          speaker_name: enableSpeakerDiarization ? 'Speaker 2' : undefined
        }
      ];

      const fullText = mockSegments.map(segment => segment.text).join(' ');

      // Update transcription
      const updatedTranscription = await this.transcriptionRepository.update(transcriptionId, {
        full_text: fullText,
        segments: mockSegments,
        language_code: 'en',
        confidence_score: 0.93,
        metadata: {
          model_version: 'gpt-4o-transcribe',
          audio_duration: recording.duration_seconds,
          speaker_count: enableSpeakerDiarization ? 2 : undefined,
          additional_info: {
            processing_time_seconds: processingTimeSeconds
          }
        }
      });

      // Update recording status
      await this.audioRecordingRepository.update(recording.recording_id, {
        transcription_status: TranscriptionStatus.COMPLETED
      });

      return updatedTranscription;
    } catch (error) {
      console.error('Error processing transcription with Whisper:', error);
      
      // Update recording status to failed
      const transcription = await this.transcriptionRepository.findById(transcriptionId);
      if (transcription) {
        await this.audioRecordingRepository.update(transcription.recording_id, {
          transcription_status: TranscriptionStatus.FAILED
        });
      }
      
      throw error;
    }
  }

  /**
   * Process transcription with Vosk
   * @param transcriptionId Transcription ID
   * @param enableSpeakerDiarization Enable speaker diarization
   * @returns Updated transcription
   */
  public async processWithVosk(
    transcriptionId: string,
    enableSpeakerDiarization: boolean = true
  ): Promise<Transcription> {
    try {
      // Get transcription
      const transcription = await this.transcriptionRepository.findById(transcriptionId);
      
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Get recording
      const recording = await this.audioRecordingRepository.findById(transcription.recording_id);
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // Read audio file
      const audioFile = await readFile(recording.file_path);

      // In a real implementation, you would use the Vosk library here
      // For now, we'll just simulate the process with a mock response

      // Mock processing time
      const processingTimeSeconds = 3;

      // Mock transcription result
      const mockSegments: TranscriptionSegment[] = [
        {
          segment_id: '1',
          start_time: 0,
          end_time: 5,
          text: 'Hello, this is a test transcription.',
          confidence_score: 0.88,
          speaker_id: enableSpeakerDiarization ? 'speaker1' : undefined,
          speaker_name: enableSpeakerDiarization ? 'Speaker 1' : undefined
        },
        {
          segment_id: '2',
          start_time: 5,
          end_time: 10,
          text: 'This is another segment of the transcription.',
          confidence_score: 0.85,
          speaker_id: enableSpeakerDiarization ? 'speaker2' : undefined,
          speaker_name: enableSpeakerDiarization ? 'Speaker 2' : undefined
        }
      ];

      const fullText = mockSegments.map(segment => segment.text).join(' ');

      // Update transcription
      const updatedTranscription = await this.transcriptionRepository.update(transcriptionId, {
        full_text: fullText,
        segments: mockSegments,
        language_code: 'en',
        confidence_score: 0.86,
        metadata: {
          model_version: 'vosk-model-en-us-0.22',
          audio_duration: recording.duration_seconds,
          speaker_count: enableSpeakerDiarization ? 2 : undefined,
          additional_info: {
            processing_time_seconds: processingTimeSeconds
          }
        }
      });

      // Update recording status
      await this.audioRecordingRepository.update(recording.recording_id, {
        transcription_status: TranscriptionStatus.COMPLETED
      });

      return updatedTranscription;
    } catch (error) {
      console.error('Error processing transcription with Vosk:', error);
      
      // Update recording status to failed
      const transcription = await this.transcriptionRepository.findById(transcriptionId);
      if (transcription) {
        await this.audioRecordingRepository.update(transcription.recording_id, {
          transcription_status: TranscriptionStatus.FAILED
        });
      }
      
      throw error;
    }
  }

  /**
   * Process transcription with hybrid approach (Whisper + Vosk)
   * @param transcriptionId Transcription ID
   * @param enableSpeakerDiarization Enable speaker diarization
   * @returns Updated transcription
   */
  public async processWithHybrid(
    transcriptionId: string,
    enableSpeakerDiarization: boolean = true
  ): Promise<Transcription> {
    try {
      // Get transcription
      const transcription = await this.transcriptionRepository.findById(transcriptionId);
      
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Get recording
      const recording = await this.audioRecordingRepository.findById(transcription.recording_id);
      
      if (!recording) {
        throw new Error('Recording not found');
      }

      // In a real implementation, you would:
      // 1. Process with Vosk for offline initial transcription
      // 2. Process with Whisper for higher accuracy
      // 3. Merge results based on confidence scores
      // 4. Apply speaker diarization with pyannote if enabled

      // For now, we'll just use the Whisper mock implementation
      return this.processWithWhisper(transcriptionId, enableSpeakerDiarization);
    } catch (error) {
      console.error('Error processing transcription with hybrid approach:', error);
      throw error;
    }
  }

  /**
   * Create or update speaker
   * @param speakerId Speaker ID (optional, will be generated if not provided)
   * @param name Speaker name
   * @param characterId Character ID (optional)
   * @param userId User ID (optional)
   * @returns Speaker identification
   */
  public async createOrUpdateSpeaker(
    speakerId: string | undefined,
    name: string,
    characterId?: string,
    userId?: string
  ): Promise<SpeakerIdentification> {
    return this.transcriptionRepository.createOrUpdateSpeaker(speakerId, name, characterId, userId);
  }

  /**
   * Update speaker identification
   * @param speakerId Speaker ID
   * @param params Speaker identification update parameters
   * @returns Updated speaker identification
   */
  public async updateSpeakerIdentification(
    speakerId: string,
    params: SpeakerIdentificationUpdateParams
  ): Promise<SpeakerIdentification> {
    return this.transcriptionRepository.updateSpeakerIdentification(speakerId, params);
  }

  /**
   * Get all speakers for a session
   * @param sessionId Session ID
   * @returns Speaker identifications
   */
  public async getSpeakersForSession(sessionId: string): Promise<SpeakerIdentification[]> {
    return this.transcriptionRepository.getSpeakersForSession(sessionId);
  }
}
