import { Router } from 'express';
import { TranscriptionController } from '../controllers/transcription.controller';
import { RepositoryFactory } from '../repositories/repository.factory';
import { TranscriptionService } from '../services/transcription.service';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Create transcription routes
 * @param repositoryFactory Repository factory
 * @returns Router
 */
export function transcriptionRoutes(repositoryFactory: RepositoryFactory): Router {
  const router = Router();
  
  // Create service
  const transcriptionService = new TranscriptionService(
    repositoryFactory.getTranscriptionRepository(),
    repositoryFactory.getAudioRecordingRepository()
  );
  
  // Create controller
  const transcriptionController = new TranscriptionController(transcriptionService);
  
  // Routes
  router.get('/:transcriptionId', authenticate(), transcriptionController.getById);
  router.get('/recording/:recordingId', authenticate(), transcriptionController.getByRecordingId);
  router.delete('/:transcriptionId', authenticate(), transcriptionController.delete);
  router.post('/:transcriptionId/process/whisper', authenticate(), transcriptionController.processWithWhisper);
  router.post('/:transcriptionId/process/vosk', authenticate(), transcriptionController.processWithVosk);
  router.post('/:transcriptionId/process/hybrid', authenticate(), transcriptionController.processWithHybrid);
  router.post('/speakers', authenticate(), transcriptionController.createOrUpdateSpeaker);
  router.put('/speakers/:speakerId', authenticate(), transcriptionController.updateSpeakerIdentification);
  router.get('/session/:sessionId/speakers', authenticate(), transcriptionController.getSpeakersForSession);
  
  return router;
}
