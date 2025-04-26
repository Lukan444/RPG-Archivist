import { TranscriptionService } from '../../services/transcription.service';
import { TranscriptionRepository } from '../../repositories/transcription.repository';
import { AudioRecordingRepository } from '../../repositories/audio-recording.repository';
import { Transcription, TranscriptionSegment, SpeakerIdentification } from '../../models/transcription.model';
import { TranscriptionStatus } from '../../models/audio-recording.model';
import * as fs from 'fs';

// Mock dependencies
jest.mock('../../repositories/transcription.repository');
jest.mock('../../repositories/audio-recording.repository');
jest.mock('fs');
jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn),
}));

describe('TranscriptionService', () => {
  let transcriptionService: TranscriptionService;
  let transcriptionRepository: jest.Mocked<TranscriptionRepository>;
  let audioRecordingRepository: jest.Mocked<AudioRecordingRepository>;

  // Mock data
  const mockTranscription: Transcription = {
    transcription_id: 'test-transcription-id',
    recording_id: 'test-recording-id',
    session_id: 'test-session-id',
    full_text: 'This is a test transcription.',
    segments: [],
    language_code: 'en',
    confidence_score: 0.9,
    created_at: Date.now(),
    updated_at: Date.now(),
    metadata: {}
  };

  const mockRecording = {
    recording_id: 'test-recording-id',
    session_id: 'test-session-id',
    file_path: '/path/to/audio.mp3',
    duration_seconds: 60,
    transcription_status: TranscriptionStatus.PENDING,
    created_at: Date.now(),
    updated_at: Date.now()
  };

  const mockSpeaker: SpeakerIdentification = {
    speaker_id: 'test-speaker-id',
    name: 'Test Speaker',
    character_id: 'test-character-id',
    user_id: 'test-user-id',
    created_at: Date.now(),
    updated_at: Date.now()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock repositories
    transcriptionRepository = {
      findById: jest.fn(),
      findByRecordingId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createOrUpdateSpeaker: jest.fn(),
      updateSpeakerIdentification: jest.fn(),
      getSpeakersForSession: jest.fn()
    } as unknown as jest.Mocked<TranscriptionRepository>;
    
    audioRecordingRepository = {
      findById: jest.fn(),
      update: jest.fn()
    } as unknown as jest.Mocked<AudioRecordingRepository>;
    
    // Create service with mock repositories
    transcriptionService = new TranscriptionService(
      transcriptionRepository,
      audioRecordingRepository
    );

    // Setup default mock implementations
    transcriptionRepository.findById.mockResolvedValue(mockTranscription);
    transcriptionRepository.findByRecordingId.mockResolvedValue(mockTranscription);
    transcriptionRepository.update.mockImplementation((id, params) => {
      return Promise.resolve({
        ...mockTranscription,
        ...params,
        transcription_id: id
      });
    });
    transcriptionRepository.delete.mockResolvedValue(true);
    transcriptionRepository.createOrUpdateSpeaker.mockResolvedValue(mockSpeaker);
    transcriptionRepository.updateSpeakerIdentification.mockResolvedValue(mockSpeaker);
    transcriptionRepository.getSpeakersForSession.mockResolvedValue([mockSpeaker]);
    
    audioRecordingRepository.findById.mockResolvedValue(mockRecording);
    audioRecordingRepository.update.mockResolvedValue(mockRecording);
    
    (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('mock audio data'));
  });

  describe('getById', () => {
    it('should return transcription by ID', async () => {
      // Act
      const result = await transcriptionService.getById('test-transcription-id');
      
      // Assert
      expect(transcriptionRepository.findById).toHaveBeenCalledWith('test-transcription-id');
      expect(result).toEqual(mockTranscription);
    });

    it('should return null if transcription not found', async () => {
      // Arrange
      transcriptionRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await transcriptionService.getById('non-existent-id');
      
      // Assert
      expect(transcriptionRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getByRecordingId', () => {
    it('should return transcription by recording ID', async () => {
      // Act
      const result = await transcriptionService.getByRecordingId('test-recording-id');
      
      // Assert
      expect(transcriptionRepository.findByRecordingId).toHaveBeenCalledWith('test-recording-id');
      expect(result).toEqual(mockTranscription);
    });

    it('should return null if transcription not found', async () => {
      // Arrange
      transcriptionRepository.findByRecordingId.mockResolvedValue(null);
      
      // Act
      const result = await transcriptionService.getByRecordingId('non-existent-id');
      
      // Assert
      expect(transcriptionRepository.findByRecordingId).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update transcription', async () => {
      // Arrange
      const updateParams = {
        full_text: 'Updated transcription text',
        language_code: 'fr'
      };
      
      // Act
      const result = await transcriptionService.update('test-transcription-id', updateParams);
      
      // Assert
      expect(transcriptionRepository.update).toHaveBeenCalledWith('test-transcription-id', updateParams);
      expect(result).toEqual({
        ...mockTranscription,
        ...updateParams,
        transcription_id: 'test-transcription-id'
      });
    });

    it('should update recording status to completed if segments are provided', async () => {
      // Arrange
      const segments: TranscriptionSegment[] = [
        {
          segment_id: '1',
          start_time: 0,
          end_time: 5,
          text: 'This is a test segment.',
          confidence_score: 0.9
        }
      ];
      
      const updateParams = {
        segments
      };
      
      // Act
      const result = await transcriptionService.update('test-transcription-id', updateParams);
      
      // Assert
      expect(transcriptionRepository.update).toHaveBeenCalledWith('test-transcription-id', updateParams);
      expect(audioRecordingRepository.update).toHaveBeenCalledWith('test-recording-id', {
        transcription_status: TranscriptionStatus.COMPLETED
      });
      expect(result).toEqual({
        ...mockTranscription,
        segments,
        transcription_id: 'test-transcription-id'
      });
    });
  });

  describe('delete', () => {
    it('should delete transcription', async () => {
      // Act
      const result = await transcriptionService.delete('test-transcription-id');
      
      // Assert
      expect(transcriptionRepository.delete).toHaveBeenCalledWith('test-transcription-id');
      expect(result).toBe(true);
    });
  });

  describe('processWithWhisper', () => {
    it('should process transcription with Whisper', async () => {
      // Act
      const result = await transcriptionService.processWithWhisper('test-transcription-id', true);
      
      // Assert
      expect(transcriptionRepository.findById).toHaveBeenCalledWith('test-transcription-id');
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/audio.mp3');
      expect(transcriptionRepository.update).toHaveBeenCalled();
      expect(audioRecordingRepository.update).toHaveBeenCalledWith('test-recording-id', {
        transcription_status: TranscriptionStatus.COMPLETED
      });
      
      // Verify result contains expected fields
      expect(result).toHaveProperty('full_text');
      expect(result).toHaveProperty('segments');
      expect(result).toHaveProperty('language_code', 'en');
      expect(result).toHaveProperty('confidence_score');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('model_version', 'gpt-4o-transcribe');
    });

    it('should process transcription without speaker diarization', async () => {
      // Act
      const result = await transcriptionService.processWithWhisper('test-transcription-id', false);
      
      // Assert
      expect(transcriptionRepository.update).toHaveBeenCalled();
      
      // Verify segments don't have speaker information
      const updateCall = transcriptionRepository.update.mock.calls[0][1];
      expect(updateCall.segments).toBeDefined();
      expect(updateCall.segments[0]).not.toHaveProperty('speaker_name');
      expect(updateCall.segments[0]).not.toHaveProperty('speaker_id');
    });

    it('should throw error if transcription not found', async () => {
      // Arrange
      transcriptionRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        transcriptionService.processWithWhisper('non-existent-id')
      ).rejects.toThrow('Transcription not found');
    });

    it('should throw error if recording not found', async () => {
      // Arrange
      audioRecordingRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        transcriptionService.processWithWhisper('test-transcription-id')
      ).rejects.toThrow('Recording not found');
    });

    it('should update recording status to failed on error', async () => {
      // Arrange
      fs.readFile.mockRejectedValue(new Error('File read error'));
      
      // Act & Assert
      await expect(
        transcriptionService.processWithWhisper('test-transcription-id')
      ).rejects.toThrow('File read error');
      
      expect(audioRecordingRepository.update).toHaveBeenCalledWith('test-recording-id', {
        transcription_status: TranscriptionStatus.FAILED
      });
    });
  });

  describe('processWithVosk', () => {
    it('should process transcription with Vosk', async () => {
      // Act
      const result = await transcriptionService.processWithVosk('test-transcription-id', true);
      
      // Assert
      expect(transcriptionRepository.findById).toHaveBeenCalledWith('test-transcription-id');
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/audio.mp3');
      expect(transcriptionRepository.update).toHaveBeenCalled();
      expect(audioRecordingRepository.update).toHaveBeenCalledWith('test-recording-id', {
        transcription_status: TranscriptionStatus.COMPLETED
      });
      
      // Verify result contains expected fields
      expect(result).toHaveProperty('full_text');
      expect(result).toHaveProperty('segments');
      expect(result).toHaveProperty('language_code', 'en');
      expect(result).toHaveProperty('confidence_score');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('model_version', 'vosk-model-en-us-0.22');
    });

    it('should throw error if transcription not found', async () => {
      // Arrange
      transcriptionRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        transcriptionService.processWithVosk('non-existent-id')
      ).rejects.toThrow('Transcription not found');
    });
  });

  describe('processWithHybrid', () => {
    it('should process transcription with hybrid approach', async () => {
      // Act
      const result = await transcriptionService.processWithHybrid('test-transcription-id', true);
      
      // Assert
      expect(transcriptionRepository.findById).toHaveBeenCalledWith('test-transcription-id');
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      
      // Verify it calls processWithWhisper internally
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/audio.mp3');
      expect(transcriptionRepository.update).toHaveBeenCalled();
      expect(audioRecordingRepository.update).toHaveBeenCalledWith('test-recording-id', {
        transcription_status: TranscriptionStatus.COMPLETED
      });
    });

    it('should throw error if transcription not found', async () => {
      // Arrange
      transcriptionRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        transcriptionService.processWithHybrid('non-existent-id')
      ).rejects.toThrow('Transcription not found');
    });
  });

  describe('createOrUpdateSpeaker', () => {
    it('should create or update speaker', async () => {
      // Act
      const result = await transcriptionService.createOrUpdateSpeaker(
        'test-speaker-id',
        'Test Speaker',
        'test-character-id',
        'test-user-id'
      );
      
      // Assert
      expect(transcriptionRepository.createOrUpdateSpeaker).toHaveBeenCalledWith(
        'test-speaker-id',
        'Test Speaker',
        'test-character-id',
        'test-user-id'
      );
      expect(result).toEqual(mockSpeaker);
    });
  });

  describe('updateSpeakerIdentification', () => {
    it('should update speaker identification', async () => {
      // Arrange
      const updateParams = {
        name: 'Updated Speaker Name',
        character_id: 'updated-character-id'
      };
      
      // Act
      const result = await transcriptionService.updateSpeakerIdentification(
        'test-speaker-id',
        updateParams
      );
      
      // Assert
      expect(transcriptionRepository.updateSpeakerIdentification).toHaveBeenCalledWith(
        'test-speaker-id',
        updateParams
      );
      expect(result).toEqual(mockSpeaker);
    });
  });

  describe('getSpeakersForSession', () => {
    it('should get speakers for session', async () => {
      // Act
      const result = await transcriptionService.getSpeakersForSession('test-session-id');
      
      // Assert
      expect(transcriptionRepository.getSpeakersForSession).toHaveBeenCalledWith('test-session-id');
      expect(result).toEqual([mockSpeaker]);
    });
  });
});
