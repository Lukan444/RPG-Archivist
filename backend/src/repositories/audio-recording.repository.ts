import { BaseRepository } from './base.repository';
import { DatabaseService } from '../services/database.service';
import { AudioRecording, AudioRecordingCreationParams, AudioRecordingUpdateParams, TranscriptionStatus } from '../models/audio-recording.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for managing audio recordings
 */
export class AudioRecordingRepository extends BaseRepository {
  constructor(dbService: DatabaseService) {
    super(dbService);
  }

  /**
   * Find all audio recordings for a session
   * @param sessionId Session ID
   * @param page Page number
   * @param limit Number of items per page
   * @param sort Sort field
   * @param order Sort order
   * @returns Audio recordings and total count
   */
  public async findAllBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'created_at',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ recordings: AudioRecording[], total: number }> {
    try {
      const skip = (page - 1) * limit;

      const query = `
        MATCH (r:AudioRecording)-[:BELONGS_TO]->(s:Session {session_id: $sessionId})
        RETURN COUNT(r) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records[0].get('total').toNumber();
      });

      const recordingsQuery = `
        MATCH (r:AudioRecording)-[:BELONGS_TO]->(s:Session {session_id: $sessionId})
        RETURN r {
          .*,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as recording
        ORDER BY r.${sort} ${order}
        SKIP $skip
        LIMIT $limit
      `;

      const recordings = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(recordingsQuery, {
          sessionId,
          skip,
          limit
        });

        return result.records.map(record => {
          const recording = record.get('recording');
          return {
            recording_id: recording.recording_id,
            session_id: recording.session_id,
            name: recording.name,
            description: recording.description,
            file_path: recording.file_path,
            duration_seconds: recording.duration_seconds,
            file_size_bytes: recording.file_size_bytes,
            file_format: recording.file_format,
            sample_rate: recording.sample_rate,
            channels: recording.channels,
            bit_depth: recording.bit_depth,
            created_at: recording.created_at,
            created_by: recording.created_by,
            transcription_status: recording.transcription_status as TranscriptionStatus,
            transcription_id: recording.transcription_id
          };
        });
      });

      return { recordings, total: countResult };
    } catch (error) {
      console.error('Error finding audio recordings by session:', error);
      throw error;
    }
  }

  /**
   * Find audio recording by ID
   * @param recordingId Recording ID
   * @returns Audio recording
   */
  public async findById(recordingId: string): Promise<AudioRecording | null> {
    try {
      const query = `
        MATCH (r:AudioRecording {recording_id: $recordingId})-[:BELONGS_TO]->(s:Session)
        RETURN r {
          .*,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as recording
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { recordingId });
        return result.records.length > 0 ? result.records[0].get('recording') : null;
      });

      if (!result) {
        return null;
      }

      return {
        recording_id: result.recording_id,
        session_id: result.session_id,
        name: result.name,
        description: result.description,
        file_path: result.file_path,
        duration_seconds: result.duration_seconds,
        file_size_bytes: result.file_size_bytes,
        file_format: result.file_format,
        sample_rate: result.sample_rate,
        channels: result.channels,
        bit_depth: result.bit_depth,
        created_at: result.created_at,
        created_by: result.created_by,
        transcription_status: result.transcription_status as TranscriptionStatus,
        transcription_id: result.transcription_id
      };
    } catch (error) {
      console.error('Error finding audio recording by ID:', error);
      throw error;
    }
  }

  /**
   * Create audio recording
   * @param params Audio recording creation parameters
   * @param userId User ID
   * @returns Created audio recording
   */
  public async create(params: AudioRecordingCreationParams, userId: string): Promise<AudioRecording> {
    try {
      const recordingId = uuidv4();
      const now = new Date().toISOString();

      const query = `
        MATCH (s:Session {session_id: $sessionId})
        CREATE (r:AudioRecording {
          recording_id: $recordingId,
          name: $name,
          description: $description,
          file_path: $filePath,
          duration_seconds: $durationSeconds,
          file_size_bytes: $fileSizeBytes,
          file_format: $fileFormat,
          sample_rate: $sampleRate,
          channels: $channels,
          bit_depth: $bitDepth,
          created_at: $createdAt,
          created_by: $userId,
          transcription_status: $transcriptionStatus
        })-[:BELONGS_TO]->(s)
        RETURN r {
          .*,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as recording
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          recordingId,
          sessionId: params.session_id,
          name: params.name,
          description: params.description || null,
          filePath: params.file_path,
          durationSeconds: params.duration_seconds,
          fileSizeBytes: params.file_size_bytes,
          fileFormat: params.file_format,
          sampleRate: params.sample_rate,
          channels: params.channels,
          bitDepth: params.bit_depth,
          createdAt: now,
          userId,
          transcriptionStatus: TranscriptionStatus.NOT_STARTED
        });

        return result.records[0].get('recording');
      });

      return {
        recording_id: result.recording_id,
        session_id: result.session_id,
        name: result.name,
        description: result.description,
        file_path: result.file_path,
        duration_seconds: result.duration_seconds,
        file_size_bytes: result.file_size_bytes,
        file_format: result.file_format,
        sample_rate: result.sample_rate,
        channels: result.channels,
        bit_depth: result.bit_depth,
        created_at: result.created_at,
        created_by: result.created_by,
        transcription_status: result.transcription_status as TranscriptionStatus,
        transcription_id: result.transcription_id
      };
    } catch (error) {
      console.error('Error creating audio recording:', error);
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
    try {
      const now = new Date().toISOString();

      // Build dynamic SET clause based on provided parameters
      let setClause = 'r.updated_at = $updatedAt';
      const parameters: Record<string, any> = { recordingId, updatedAt: now };

      if (params.name !== undefined) {
        setClause += ', r.name = $name';
        parameters.name = params.name;
      }

      if (params.description !== undefined) {
        setClause += ', r.description = $description';
        parameters.description = params.description;
      }

      if (params.transcription_status !== undefined) {
        setClause += ', r.transcription_status = $transcriptionStatus';
        parameters.transcriptionStatus = params.transcription_status;
      }

      if (params.transcription_id !== undefined) {
        setClause += ', r.transcription_id = $transcriptionId';
        parameters.transcriptionId = params.transcription_id;
      }

      const query = `
        MATCH (r:AudioRecording {recording_id: $recordingId})-[:BELONGS_TO]->(s:Session)
        SET ${setClause}
        RETURN r {
          .*,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as recording
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, parameters);

        if (result.records.length === 0) {
          throw new Error('Audio recording not found');
        }

        return result.records[0].get('recording');
      });

      return {
        recording_id: result.recording_id,
        session_id: result.session_id,
        name: result.name,
        description: result.description,
        file_path: result.file_path,
        duration_seconds: result.duration_seconds,
        file_size_bytes: result.file_size_bytes,
        file_format: result.file_format,
        sample_rate: result.sample_rate,
        channels: result.channels,
        bit_depth: result.bit_depth,
        created_at: result.created_at,
        created_by: result.created_by,
        transcription_status: result.transcription_status as TranscriptionStatus,
        transcription_id: result.transcription_id
      };
    } catch (error) {
      console.error('Error updating audio recording:', error);
      throw error;
    }
  }

  /**
   * Delete audio recording
   * @param recordingId Recording ID
   * @returns True if deleted
   */
  public async delete(recordingId: string): Promise<boolean> {
    try {
      // First check if recording has a transcription
      const checkQuery = `
        MATCH (t:Transcription)-[:TRANSCRIBES]->(:AudioRecording {recording_id: $recordingId})
        RETURN COUNT(t) as transcriptionCount
      `;

      const transcriptionCount = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(checkQuery, { recordingId });
        return result.records[0].get('transcriptionCount').toNumber();
      });

      // If there's a transcription, delete it first
      if (transcriptionCount > 0) {
        const deleteTranscriptionQuery = `
          MATCH (t:Transcription)-[:TRANSCRIBES]->(:AudioRecording {recording_id: $recordingId})
          DETACH DELETE t
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(deleteTranscriptionQuery, { recordingId });
        });
      }

      // Now delete the recording
      const deleteQuery = `
        MATCH (r:AudioRecording {recording_id: $recordingId})
        DETACH DELETE r
        RETURN true as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(deleteQuery, { recordingId });
        return result.records.length > 0 ? result.records[0].get('deleted') : false;
      });

      return result;
    } catch (error) {
      console.error('Error deleting audio recording:', error);
      throw error;
    }
  }
}
