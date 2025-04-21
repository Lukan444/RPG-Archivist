import { Request, Response } from 'express';
import { AudioRecordingService } from '../services/audio-recording.service';
import { AudioRecordingUpdateParams, TranscriptionStatus } from '../models/audio-recording.model';
import { validateRequest } from '../utils/validation';
import { z } from 'zod';
import multer from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    const allowedMimeTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

/**
 * Audio recording controller
 */
export class AudioRecordingController {
  private audioRecordingService: AudioRecordingService;

  constructor(audioRecordingService: AudioRecordingService) {
    this.audioRecordingService = audioRecordingService;
  }

  /**
   * Get all audio recordings for a session
   * @param req Request
   * @param res Response
   */
  public getAllBySession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const { page = '1', limit = '20', sort = 'created_at', order = 'desc' } = req.query;

      const result = await this.audioRecordingService.getAllBySession(
        sessionId,
        parseInt(page as string),
        parseInt(limit as string),
        sort as string,
        order as 'asc' | 'desc'
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting audio recordings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting audio recordings.'
        }
      });
    }
  };

  /**
   * Get audio recording by ID
   * @param req Request
   * @param res Response
   */
  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      const recording = await this.audioRecordingService.getById(recordingId);

      if (!recording) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RECORDING_NOT_FOUND',
            message: 'Audio recording not found.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: recording
      });
    } catch (error) {
      console.error('Error getting audio recording:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the audio recording.'
        }
      });
    }
  };

  /**
   * Upload audio recording
   * @param req Request
   * @param res Response
   */
  public upload = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = z.object({
        sessionId: z.string().uuid(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        autoTranscribe: z.boolean().optional(),
        enableSpeakerDiarization: z.boolean().optional(),
        noiseReductionLevel: z.enum(['none', 'low', 'medium', 'high']).optional(),
        transcriptionService: z.enum(['openai_whisper', 'vosk', 'hybrid']).optional()
      });

      const validationResult = validateRequest(req.body, schema);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validationResult.errors
          }
        });
        return;
      }

      // Check if file exists
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: 'Audio file is required.'
          }
        });
        return;
      }

      const { sessionId, name, description, autoTranscribe, enableSpeakerDiarization, noiseReductionLevel, transcriptionService } = req.body;
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated.'
          }
        });
        return;
      }

      // Create audio recording
      const recording = await this.audioRecordingService.createFromFile(
        sessionId,
        name,
        description,
        req.file.buffer,
        req.file.originalname,
        userId,
        {
          auto_transcribe: autoTranscribe === 'true' || autoTranscribe === true,
          enable_speaker_diarization: enableSpeakerDiarization === 'true' || enableSpeakerDiarization === true,
          noise_reduction_level: noiseReductionLevel || 'medium',
          transcription_service: transcriptionService || 'hybrid'
        }
      );

      res.status(201).json({
        success: true,
        data: recording
      });
    } catch (error) {
      console.error('Error uploading audio recording:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while uploading the audio recording.'
        }
      });
    }
  };

  /**
   * Update audio recording
   * @param req Request
   * @param res Response
   */
  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      // Validate request
      const schema = z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional()
      });

      const validationResult = validateRequest(req.body, schema);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validationResult.errors
          }
        });
        return;
      }

      const { name, description } = req.body;

      // Check if recording exists
      const existingRecording = await this.audioRecordingService.getById(recordingId);
      if (!existingRecording) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RECORDING_NOT_FOUND',
            message: 'Audio recording not found.'
          }
        });
        return;
      }

      // Update recording
      const params: AudioRecordingUpdateParams = {};
      if (name !== undefined) params.name = name;
      if (description !== undefined) params.description = description;

      const updatedRecording = await this.audioRecordingService.update(recordingId, params);

      res.status(200).json({
        success: true,
        data: updatedRecording
      });
    } catch (error) {
      console.error('Error updating audio recording:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating the audio recording.'
        }
      });
    }
  };

  /**
   * Delete audio recording
   * @param req Request
   * @param res Response
   */
  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      // Check if recording exists
      const existingRecording = await this.audioRecordingService.getById(recordingId);
      if (!existingRecording) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RECORDING_NOT_FOUND',
            message: 'Audio recording not found.'
          }
        });
        return;
      }

      // Delete recording
      const deleted = await this.audioRecordingService.delete(recordingId);

      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error deleting audio recording:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting the audio recording.'
        }
      });
    }
  };

  /**
   * Start transcription
   * @param req Request
   * @param res Response
   */
  public startTranscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated.'
          }
        });
        return;
      }

      // Validate request
      const schema = z.object({
        enableSpeakerDiarization: z.boolean().optional(),
        noiseReductionLevel: z.enum(['none', 'low', 'medium', 'high']).optional(),
        transcriptionService: z.enum(['openai_whisper', 'vosk', 'hybrid']).optional()
      });

      const validationResult = validateRequest(req.body, schema);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validationResult.errors
          }
        });
        return;
      }

      const { enableSpeakerDiarization, noiseReductionLevel, transcriptionService } = req.body;

      // Check if recording exists
      const existingRecording = await this.audioRecordingService.getById(recordingId);
      if (!existingRecording) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RECORDING_NOT_FOUND',
            message: 'Audio recording not found.'
          }
        });
        return;
      }

      // Check if transcription is already in progress or completed
      if (
        existingRecording.transcription_status === TranscriptionStatus.IN_PROGRESS ||
        existingRecording.transcription_status === TranscriptionStatus.COMPLETED
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_ALREADY_EXISTS',
            message: `Transcription is already ${existingRecording.transcription_status}.`
          }
        });
        return;
      }

      // Start transcription
      const transcriptionId = await this.audioRecordingService.startTranscription(
        recordingId,
        userId,
        {
          enable_speaker_diarization: enableSpeakerDiarization === true,
          noise_reduction_level: noiseReductionLevel || 'medium',
          transcription_service: transcriptionService || 'hybrid'
        }
      );

      res.status(200).json({
        success: true,
        data: {
          transcription_id: transcriptionId,
          status: TranscriptionStatus.IN_PROGRESS
        }
      });
    } catch (error) {
      console.error('Error starting transcription:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while starting the transcription.'
        }
      });
    }
  };

  /**
   * Get default settings
   * @param req Request
   * @param res Response
   */
  public getDefaultSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = this.audioRecordingService.getDefaultSettings();

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting default settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the default settings.'
        }
      });
    }
  };

  /**
   * Update default settings
   * @param req Request
   * @param res Response
   */
  public updateDefaultSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = z.object({
        sample_rate: z.number().int().positive().optional(),
        channels: z.number().int().positive().optional(),
        bit_depth: z.number().int().positive().optional(),
        file_format: z.string().optional(),
        max_duration_minutes: z.number().int().positive().optional(),
        auto_transcribe: z.boolean().optional(),
        transcription_service: z.enum(['openai_whisper', 'vosk', 'hybrid']).optional(),
        enable_speaker_diarization: z.boolean().optional(),
        noise_reduction_level: z.enum(['none', 'low', 'medium', 'high']).optional()
      });

      const validationResult = validateRequest(req.body, schema);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validationResult.errors
          }
        });
        return;
      }

      const settings = this.audioRecordingService.updateDefaultSettings(req.body);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error updating default settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating the default settings.'
        }
      });
    }
  };

  /**
   * Get multer upload middleware
   * @returns Multer middleware
   */
  public getUploadMiddleware() {
    return upload.single('audio');
  }
}
