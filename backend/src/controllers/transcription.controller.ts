import { Request, Response } from 'express';
import { TranscriptionService } from '../services/transcription.service';
import { SpeakerIdentificationUpdateParams } from '../models/transcription.model';
import { validateRequest } from '../utils/validation';
import { z } from 'zod';

/**
 * Transcription controller
 */
export class TranscriptionController {
  private transcriptionService: TranscriptionService;

  constructor(transcriptionService: TranscriptionService) {
    this.transcriptionService = transcriptionService;
  }

  /**
   * Get transcription by ID
   * @param req Request
   * @param res Response
   */
  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptionId } = req.params;

      const transcription = await this.transcriptionService.getById(transcriptionId);

      if (!transcription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_NOT_FOUND',
            message: 'Transcription not found.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      console.error('Error getting transcription:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the transcription.'
        }
      });
    }
  };

  /**
   * Get transcription by recording ID
   * @param req Request
   * @param res Response
   */
  public getByRecordingId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      const transcription = await this.transcriptionService.getByRecordingId(recordingId);

      if (!transcription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_NOT_FOUND',
            message: 'Transcription not found for this recording.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      console.error('Error getting transcription by recording ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the transcription.'
        }
      });
    }
  };

  /**
   * Delete transcription
   * @param req Request
   * @param res Response
   */
  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptionId } = req.params;

      // Check if transcription exists
      const existingTranscription = await this.transcriptionService.getById(transcriptionId);
      if (!existingTranscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_NOT_FOUND',
            message: 'Transcription not found.'
          }
        });
        return;
      }

      // Delete transcription
      const deleted = await this.transcriptionService.delete(transcriptionId);

      res.status(200).json({
        success: true,
        data: {
          deleted
        }
      });
    } catch (error) {
      console.error('Error deleting transcription:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while deleting the transcription.'
        }
      });
    }
  };

  /**
   * Process transcription with Whisper
   * @param req Request
   * @param res Response
   */
  public processWithWhisper = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptionId } = req.params;

      // Validate request
      const schema = z.object({
        enableSpeakerDiarization: z.boolean().optional()
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

      const { enableSpeakerDiarization = true } = req.body;

      // Check if transcription exists
      const existingTranscription = await this.transcriptionService.getById(transcriptionId);
      if (!existingTranscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_NOT_FOUND',
            message: 'Transcription not found.'
          }
        });
        return;
      }

      // Process transcription
      const transcription = await this.transcriptionService.processWithWhisper(
        transcriptionId,
        enableSpeakerDiarization
      );

      res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      console.error('Error processing transcription with Whisper:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while processing the transcription.'
        }
      });
    }
  };

  /**
   * Process transcription with Vosk
   * @param req Request
   * @param res Response
   */
  public processWithVosk = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptionId } = req.params;

      // Validate request
      const schema = z.object({
        enableSpeakerDiarization: z.boolean().optional()
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

      const { enableSpeakerDiarization = true } = req.body;

      // Check if transcription exists
      const existingTranscription = await this.transcriptionService.getById(transcriptionId);
      if (!existingTranscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_NOT_FOUND',
            message: 'Transcription not found.'
          }
        });
        return;
      }

      // Process transcription
      const transcription = await this.transcriptionService.processWithVosk(
        transcriptionId,
        enableSpeakerDiarization
      );

      res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      console.error('Error processing transcription with Vosk:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while processing the transcription.'
        }
      });
    }
  };

  /**
   * Process transcription with hybrid approach
   * @param req Request
   * @param res Response
   */
  public processWithHybrid = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptionId } = req.params;

      // Validate request
      const schema = z.object({
        enableSpeakerDiarization: z.boolean().optional()
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

      const { enableSpeakerDiarization = true } = req.body;

      // Check if transcription exists
      const existingTranscription = await this.transcriptionService.getById(transcriptionId);
      if (!existingTranscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRANSCRIPTION_NOT_FOUND',
            message: 'Transcription not found.'
          }
        });
        return;
      }

      // Process transcription
      const transcription = await this.transcriptionService.processWithHybrid(
        transcriptionId,
        enableSpeakerDiarization
      );

      res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      console.error('Error processing transcription with hybrid approach:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while processing the transcription.'
        }
      });
    }
  };

  /**
   * Create or update speaker
   * @param req Request
   * @param res Response
   */
  public createOrUpdateSpeaker = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const schema = z.object({
        speaker_id: z.string().uuid().optional(),
        name: z.string().min(1).max(100),
        character_id: z.string().uuid().optional(),
        user_id: z.string().uuid().optional()
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

      const { speaker_id, name, character_id, user_id } = req.body;

      // Create or update speaker
      const speaker = await this.transcriptionService.createOrUpdateSpeaker(
        speaker_id,
        name,
        character_id,
        user_id
      );

      res.status(200).json({
        success: true,
        data: speaker
      });
    } catch (error) {
      console.error('Error creating or updating speaker:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating or updating the speaker.'
        }
      });
    }
  };

  /**
   * Update speaker identification
   * @param req Request
   * @param res Response
   */
  public updateSpeakerIdentification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { speakerId } = req.params;

      // Validate request
      const schema = z.object({
        speaker_name: z.string().min(1).max(100).optional(),
        character_id: z.string().uuid().nullable().optional(),
        user_id: z.string().uuid().nullable().optional()
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

      const params: SpeakerIdentificationUpdateParams = {};
      if (req.body.speaker_name !== undefined) params.speaker_name = req.body.speaker_name;
      if (req.body.character_id !== undefined) params.character_id = req.body.character_id;
      if (req.body.user_id !== undefined) params.user_id = req.body.user_id;

      // Update speaker identification
      const speaker = await this.transcriptionService.updateSpeakerIdentification(
        speakerId,
        params
      );

      res.status(200).json({
        success: true,
        data: speaker
      });
    } catch (error) {
      console.error('Error updating speaker identification:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating the speaker identification.'
        }
      });
    }
  };

  /**
   * Get all speakers for a session
   * @param req Request
   * @param res Response
   */
  public getSpeakersForSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      // Get speakers
      const speakers = await this.transcriptionService.getSpeakersForSession(sessionId);

      res.status(200).json({
        success: true,
        data: speakers
      });
    } catch (error) {
      console.error('Error getting speakers for session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while getting the speakers for the session.'
        }
      });
    }
  };
}
