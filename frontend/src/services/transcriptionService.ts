/**
 * Transcription service
 */
export const transcriptionService = {
  /**
   * Get transcription by ID
   * @param transcriptionId Transcription ID
   * @returns Transcription
   */
  getById: async (transcriptionId: string) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: {
        transcription_id: transcriptionId,
        recording_id: 'recording-123',
        session_id: 'session-123',
        full_text: 'This is a test transcription.',
        segments: [
          {
            segment_id: 'segment1',
            start_time: 0,
            end_time: 10,
            text: 'This is a test segment',
            speaker_name: 'Speaker 1'
          }
        ],
        language_code: 'en',
        confidence_score: 0.9,
        created_at: Date.now(),
        updated_at: Date.now(),
        metadata: {
          model_version: 'gpt-4o-transcribe',
          audio_duration: 60,
          speaker_count: 2,
          additional_info: {
            processing_time_seconds: 5
          }
        }
      }
    };
  },

  /**
   * Get transcription by recording ID
   * @param recordingId Recording ID
   * @returns Transcription
   */
  getByRecordingId: async (recordingId: string) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: {
        transcription_id: 'transcription-123',
        recording_id: recordingId,
        session_id: 'session-123',
        full_text: 'This is a test transcription.',
        segments: [
          {
            segment_id: 'segment1',
            start_time: 0,
            end_time: 10,
            text: 'This is a test segment',
            speaker_name: 'Speaker 1'
          }
        ],
        language_code: 'en',
        confidence_score: 0.9,
        created_at: Date.now(),
        updated_at: Date.now(),
        metadata: {
          model_version: 'gpt-4o-transcribe',
          audio_duration: 60,
          speaker_count: 2,
          additional_info: {
            processing_time_seconds: 5
          }
        }
      }
    };
  },

  /**
   * Update transcription
   * @param transcriptionId Transcription ID
   * @param updates Transcription updates
   * @returns Updated transcription
   */
  update: async (transcriptionId: string, updates: any) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: {
        transcription_id: transcriptionId,
        recording_id: 'recording-123',
        session_id: 'session-123',
        full_text: updates.full_text || 'This is a test transcription.',
        segments: updates.segments || [
          {
            segment_id: 'segment1',
            start_time: 0,
            end_time: 10,
            text: 'This is a test segment',
            speaker_name: 'Speaker 1'
          }
        ],
        language_code: updates.language_code || 'en',
        confidence_score: updates.confidence_score || 0.9,
        created_at: Date.now(),
        updated_at: Date.now(),
        metadata: updates.metadata || {
          model_version: 'gpt-4o-transcribe',
          audio_duration: 60,
          speaker_count: 2,
          additional_info: {
            processing_time_seconds: 5
          }
        }
      }
    };
  },

  /**
   * Delete transcription
   * @param transcriptionId Transcription ID
   * @returns Success status
   */
  delete: async (transcriptionId: string) => {
    // This would make an API call in a real implementation
    return {
      success: true
    };
  },

  /**
   * Process transcription with Whisper
   * @param transcriptionId Transcription ID
   * @param enableSpeakerDiarization Enable speaker diarization
   * @returns Processed transcription
   */
  processWithWhisper: async (transcriptionId: string, enableSpeakerDiarization: boolean = true) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: {
        transcription_id: transcriptionId,
        recording_id: 'recording-123',
        session_id: 'session-123',
        full_text: 'This is a test transcription processed with Whisper.',
        segments: [
          {
            segment_id: 'segment1',
            start_time: 0,
            end_time: 10,
            text: 'This is a test segment',
            speaker_name: enableSpeakerDiarization ? 'Speaker 1' : undefined,
            speaker_id: enableSpeakerDiarization ? 'speaker1' : undefined
          }
        ],
        language_code: 'en',
        confidence_score: 0.95,
        created_at: Date.now(),
        updated_at: Date.now(),
        metadata: {
          model_version: 'gpt-4o-transcribe',
          audio_duration: 60,
          speaker_count: enableSpeakerDiarization ? 2 : undefined,
          additional_info: {
            processing_time_seconds: 5
          }
        }
      }
    };
  },

  /**
   * Process transcription with Vosk
   * @param transcriptionId Transcription ID
   * @param enableSpeakerDiarization Enable speaker diarization
   * @returns Processed transcription
   */
  processWithVosk: async (transcriptionId: string, enableSpeakerDiarization: boolean = true) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: {
        transcription_id: transcriptionId,
        recording_id: 'recording-123',
        session_id: 'session-123',
        full_text: 'This is a test transcription processed with Vosk.',
        segments: [
          {
            segment_id: 'segment1',
            start_time: 0,
            end_time: 10,
            text: 'This is a test segment',
            speaker_name: enableSpeakerDiarization ? 'Speaker 1' : undefined,
            speaker_id: enableSpeakerDiarization ? 'speaker1' : undefined
          }
        ],
        language_code: 'en',
        confidence_score: 0.88,
        created_at: Date.now(),
        updated_at: Date.now(),
        metadata: {
          model_version: 'vosk-model-en-us-0.22',
          audio_duration: 60,
          speaker_count: enableSpeakerDiarization ? 2 : undefined,
          additional_info: {
            processing_time_seconds: 3
          }
        }
      }
    };
  },

  /**
   * Create or update speaker
   * @param speakerId Speaker ID
   * @param name Speaker name
   * @param characterId Character ID
   * @param userId User ID
   * @returns Speaker identification
   */
  createOrUpdateSpeaker: async (speakerId: string | undefined, name: string, characterId?: string, userId?: string) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: {
        speaker_id: speakerId || 'new-speaker-id',
        name,
        character_id: characterId,
        user_id: userId,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    };
  },

  /**
   * Get all speakers for a session
   * @param sessionId Session ID
   * @returns Speaker identifications
   */
  getSpeakersForSession: async (sessionId: string) => {
    // This would make an API call in a real implementation
    return {
      success: true,
      data: [
        {
          speaker_id: 'speaker1',
          name: 'Speaker 1',
          character_id: 'character1',
          user_id: 'user1',
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          speaker_id: 'speaker2',
          name: 'Speaker 2',
          character_id: 'character2',
          user_id: 'user2',
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ]
    };
  }
};
