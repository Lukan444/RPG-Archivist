import { Router } from 'express';
import { AudioRecordingController } from '../controllers/audio-recording.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { AudioRecordingService } from '../services/audio-recording.service';
import { TranscriptionService } from '../services/transcription.service';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Create audio recording routes
 * @param repositoryFactory Repository factory
 * @returns Router
 */
export function audioRecordingRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();

  // Create services
  const audioRecordingService = new AudioRecordingService(
    repositoryFactory.getAudioRecordingRepository(),
    repositoryFactory.getTranscriptionRepository()
  );

  const transcriptionService = new TranscriptionService(
    repositoryFactory.getTranscriptionRepository(),
    repositoryFactory.getAudioRecordingRepository()
  );

  // Create controller
  const audioRecordingController = new AudioRecordingController(audioRecordingService);

  // Get upload middleware
  const uploadMiddleware = audioRecordingController.getUploadMiddleware();

  // Routes
  router.get('/session/:sessionId', authenticate, audioRecordingController.getAllBySession);
  router.get('/:recordingId', authenticate, audioRecordingController.getById);
  router.post('/upload', authenticate, uploadMiddleware, audioRecordingController.upload);
  router.put('/:recordingId', authenticate, audioRecordingController.update);
  router.delete('/:recordingId', authenticate, audioRecordingController.delete);
  router.post('/:recordingId/transcribe', authenticate, audioRecordingController.startTranscription);
  router.get('/settings/default', authenticate, audioRecordingController.getDefaultSettings);
  router.put('/settings/default', authenticate, audioRecordingController.updateDefaultSettings);

  return router;
}
