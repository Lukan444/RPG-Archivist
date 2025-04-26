import { AudioRecordingService } from '../../services/audio-recording.service';
import { AudioRecordingRepository } from '../../repositories/audio-recording.repository';
import { TranscriptionRepository } from '../../repositories/transcription.repository';
import { AudioRecording, AudioRecordingSettings, TranscriptionService, TranscriptionStatus } from '../../models/audio-recording.model';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('../../repositories/audio-recording.repository');
jest.mock('../../repositories/transcription.repository');
jest.mock('fs');
jest.mock('path');
jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn),
}));
jest.mock('uuid');

describe('AudioRecordingService', () => {
  let audioRecordingService: AudioRecordingService;
  let audioRecordingRepository: jest.Mocked<AudioRecordingRepository>;
  let transcriptionRepository: jest.Mocked<TranscriptionRepository>;
  const uploadDir = '/mock/upload/dir';

  // Mock data
  const mockRecording: AudioRecording = {
    recording_id: 'test-recording-id',
    session_id: 'test-session-id',
    name: 'Test Recording',
    description: 'Test recording description',
    file_path: '/path/to/audio.wav',
    duration_seconds: 60,
    file_size_bytes: 1000000,
    file_format: 'wav',
    sample_rate: 44100,
    channels: 2,
    bit_depth: 16,
    transcription_id: 'test-transcription-id',
    transcription_status: TranscriptionStatus.COMPLETED,
    created_at: Date.now(),
    updated_at: Date.now(),
    created_by: 'test-user-id'
  };

  const mockTranscription = {
    transcription_id: 'test-transcription-id',
    recording_id: 'test-recording-id',
    session_id: 'test-session-id',
    created_at: Date.now(),
    updated_at: Date.now()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock repositories
    audioRecordingRepository = {
      findAllBySession: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<AudioRecordingRepository>;
    
    transcriptionRepository = {
      findById: jest.fn(),
      create: jest.fn()
    } as unknown as jest.Mocked<TranscriptionRepository>;
    
    // Mock path.join to return a predictable path
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    
    // Mock fs.existsSync to return false by default
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // Mock uuid.v4 to return a predictable UUID
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
    
    // Create service with mock repositories
    audioRecordingService = new AudioRecordingService(
      audioRecordingRepository,
      transcriptionRepository,
      uploadDir
    );

    // Setup default mock implementations
    audioRecordingRepository.findAllBySession.mockResolvedValue({
      recordings: [mockRecording],
      total: 1
    });
    audioRecordingRepository.findById.mockResolvedValue(mockRecording);
    audioRecordingRepository.create.mockResolvedValue(mockRecording);
    audioRecordingRepository.update.mockResolvedValue(mockRecording);
    audioRecordingRepository.delete.mockResolvedValue(true);
    
    transcriptionRepository.findById.mockResolvedValue(mockTranscription);
    transcriptionRepository.create.mockResolvedValue(mockTranscription);
  });

  describe('constructor', () => {
    it('should ensure upload directory exists', () => {
      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith(uploadDir);
      expect(fs.mkdir).toHaveBeenCalledWith(uploadDir, { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      // Act
      new AudioRecordingService(audioRecordingRepository, transcriptionRepository, uploadDir);
      
      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith(uploadDir);
      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('getAllBySession', () => {
    it('should return all recordings for a session', async () => {
      // Act
      const result = await audioRecordingService.getAllBySession('test-session-id');
      
      // Assert
      expect(audioRecordingRepository.findAllBySession).toHaveBeenCalledWith(
        'test-session-id',
        1,
        20,
        'created_at',
        'desc'
      );
      expect(result).toEqual({
        recordings: [mockRecording],
        total: 1
      });
    });

    it('should use provided pagination and sorting parameters', async () => {
      // Act
      const result = await audioRecordingService.getAllBySession(
        'test-session-id',
        2,
        10,
        'name',
        'asc'
      );
      
      // Assert
      expect(audioRecordingRepository.findAllBySession).toHaveBeenCalledWith(
        'test-session-id',
        2,
        10,
        'name',
        'asc'
      );
    });
  });

  describe('getById', () => {
    it('should return recording by ID', async () => {
      // Act
      const result = await audioRecordingService.getById('test-recording-id');
      
      // Assert
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(result).toEqual(mockRecording);
    });

    it('should return null if recording not found', async () => {
      // Arrange
      audioRecordingRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await audioRecordingService.getById('non-existent-id');
      
      // Assert
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('createFromFile', () => {
    it('should create recording from file', async () => {
      // Arrange
      const file = Buffer.from('mock audio data');
      const fileOriginalName = 'original.wav';
      
      // Act
      const result = await audioRecordingService.createFromFile(
        'test-session-id',
        'Test Recording',
        'Test recording description',
        file,
        fileOriginalName,
        'test-user-id'
      );
      
      // Assert
      expect(uuidv4).toHaveBeenCalled();
      expect(path.join).toHaveBeenCalledWith(uploadDir, 'mock-uuid.wav');
      expect(fs.writeFile).toHaveBeenCalledWith('/mock/upload/dir/mock-uuid.wav', file);
      expect(audioRecordingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'test-session-id',
          name: 'Test Recording',
          description: 'Test recording description',
          file_path: '/mock/upload/dir/mock-uuid.wav',
          file_size_bytes: file.length
        }),
        'test-user-id'
      );
      expect(result).toEqual(mockRecording);
    });

    it('should start transcription if auto-transcribe is enabled', async () => {
      // Arrange
      const file = Buffer.from('mock audio data');
      const fileOriginalName = 'original.wav';
      
      // Act
      await audioRecordingService.createFromFile(
        'test-session-id',
        'Test Recording',
        'Test recording description',
        file,
        fileOriginalName,
        'test-user-id',
        { auto_transcribe: true }
      );
      
      // Assert
      expect(audioRecordingRepository.update).toHaveBeenCalledWith(
        'test-recording-id',
        { transcription_status: TranscriptionStatus.IN_PROGRESS }
      );
      expect(transcriptionRepository.create).toHaveBeenCalled();
    });

    it('should not start transcription if auto-transcribe is disabled', async () => {
      // Arrange
      const file = Buffer.from('mock audio data');
      const fileOriginalName = 'original.wav';
      
      // Act
      await audioRecordingService.createFromFile(
        'test-session-id',
        'Test Recording',
        'Test recording description',
        file,
        fileOriginalName,
        'test-user-id',
        { auto_transcribe: false }
      );
      
      // Assert
      expect(audioRecordingRepository.update).not.toHaveBeenCalled();
      expect(transcriptionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update recording', async () => {
      // Arrange
      const updateParams = {
        name: 'Updated Recording Name',
        description: 'Updated recording description'
      };
      
      // Act
      const result = await audioRecordingService.update('test-recording-id', updateParams);
      
      // Assert
      expect(audioRecordingRepository.update).toHaveBeenCalledWith('test-recording-id', updateParams);
      expect(result).toEqual(mockRecording);
    });
  });

  describe('delete', () => {
    it('should delete recording and file', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      // Act
      const result = await audioRecordingService.delete('test-recording-id');
      
      // Assert
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(audioRecordingRepository.delete).toHaveBeenCalledWith('test-recording-id');
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/audio.wav');
      expect(fs.unlink).toHaveBeenCalledWith('/path/to/audio.wav');
      expect(result).toBe(true);
    });

    it('should not delete file if it does not exist', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      // Act
      const result = await audioRecordingService.delete('test-recording-id');
      
      // Assert
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(audioRecordingRepository.delete).toHaveBeenCalledWith('test-recording-id');
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/audio.wav');
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error if recording not found', async () => {
      // Arrange
      audioRecordingRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        audioRecordingService.delete('non-existent-id')
      ).rejects.toThrow('Recording not found');
    });
  });

  describe('startTranscription', () => {
    it('should start transcription process', async () => {
      // Arrange
      const mockRecordingWithoutTranscription = {
        ...mockRecording,
        transcription_id: undefined,
        transcription_status: TranscriptionStatus.PENDING
      };
      audioRecordingRepository.findById.mockResolvedValue(mockRecordingWithoutTranscription);
      
      // Act
      const result = await audioRecordingService.startTranscription(
        'test-recording-id',
        'test-user-id'
      );
      
      // Assert
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(audioRecordingRepository.update).toHaveBeenCalledWith(
        'test-recording-id',
        { transcription_status: TranscriptionStatus.IN_PROGRESS }
      );
      expect(transcriptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recording_id: 'test-recording-id',
          session_id: 'test-session-id'
        })
      );
      expect(result).toBe('test-transcription-id');
    });

    it('should return existing transcription ID if it exists', async () => {
      // Act
      const result = await audioRecordingService.startTranscription(
        'test-recording-id',
        'test-user-id'
      );
      
      // Assert
      expect(audioRecordingRepository.findById).toHaveBeenCalledWith('test-recording-id');
      expect(transcriptionRepository.findById).toHaveBeenCalledWith('test-transcription-id');
      expect(audioRecordingRepository.update).not.toHaveBeenCalled();
      expect(transcriptionRepository.create).not.toHaveBeenCalled();
      expect(result).toBe('test-transcription-id');
    });

    it('should throw error if recording not found', async () => {
      // Arrange
      audioRecordingRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        audioRecordingService.startTranscription('non-existent-id', 'test-user-id')
      ).rejects.toThrow('Recording not found');
    });
  });

  describe('getDefaultSettings', () => {
    it('should return default settings', () => {
      // Act
      const result = audioRecordingService.getDefaultSettings();
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        sample_rate: 44100,
        channels: 2,
        bit_depth: 16,
        file_format: 'wav',
        auto_transcribe: true,
        transcription_service: TranscriptionService.HYBRID,
        enable_speaker_diarization: true
      }));
    });

    it('should return a copy of default settings', () => {
      // Act
      const result = audioRecordingService.getDefaultSettings();
      result.sample_rate = 48000;
      
      // Assert
      expect(audioRecordingService.getDefaultSettings().sample_rate).toBe(44100);
    });
  });

  describe('updateDefaultSettings', () => {
    it('should update default settings', () => {
      // Arrange
      const newSettings: Partial<AudioRecordingSettings> = {
        sample_rate: 48000,
        channels: 1,
        transcription_service: TranscriptionService.WHISPER
      };
      
      // Act
      const result = audioRecordingService.updateDefaultSettings(newSettings);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        sample_rate: 48000,
        channels: 1,
        bit_depth: 16,
        file_format: 'wav',
        auto_transcribe: true,
        transcription_service: TranscriptionService.WHISPER,
        enable_speaker_diarization: true
      }));
    });

    it('should return a copy of updated default settings', () => {
      // Act
      const result = audioRecordingService.updateDefaultSettings({ sample_rate: 48000 });
      result.sample_rate = 96000;
      
      // Assert
      expect(audioRecordingService.getDefaultSettings().sample_rate).toBe(48000);
    });
  });
});
