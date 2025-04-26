import { BaseRepository } from './base.repository';
import { DatabaseService } from '../services/database.service';
import { Transcription, TranscriptionCreationParams, TranscriptionSegment, TranscriptionUpdateParams, SpeakerIdentification, SpeakerIdentificationUpdateParams } from '../models/transcription.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for managing transcriptions
 */
export class TranscriptionRepository extends BaseRepository {
  constructor(dbService: DatabaseService) {
    super(dbService);
  }

  /**
   * Find transcription by ID
   * @param transcriptionId Transcription ID
   * @returns Transcription
   */
  public async findById(transcriptionId: string): Promise<Transcription | null> {
    try {
      const query = `
        MATCH (t:Transcription {transcription_id: $transcriptionId})-[:TRANSCRIBES]->(r:AudioRecording)-[:BELONGS_TO]->(s:Session)
        RETURN t {
          .*,
          transcription_id: t.transcription_id,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as transcription
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { transcriptionId });
        return result.records.length > 0 ? result.records[0].get('transcription') : null;
      });

      if (!result) {
        return null;
      }

      // Get segments
      const segmentsQuery = `
        MATCH (s:TranscriptionSegment)-[:PART_OF]->(t:Transcription {transcription_id: $transcriptionId})
        OPTIONAL MATCH (s)-[:SPOKEN_BY]->(sp:Speaker)
        RETURN s {
          .*,
          segment_id: s.segment_id,
          speaker_id: sp.speaker_id,
          speaker_name: sp.name
        } as segment
        ORDER BY s.start_time
      `;

      const segments = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(segmentsQuery, { transcriptionId });
        return result.records.map(record => {
          const segment = record.get('segment');
          return {
            segment_id: segment.segment_id,
            start_time: segment.start_time,
            end_time: segment.end_time,
            text: segment.text,
            speaker_id: segment.speaker_id,
            speaker_name: segment.speaker_name,
            confidence_score: segment.confidence_score,
            words: segment.words
          } as TranscriptionSegment;
        });
      });

      return {
        transcription_id: result.transcription_id,
        recording_id: result.recording_id,
        session_id: result.session_id,
        full_text: result.full_text,
        segments: segments,
        language_code: result.language_code,
        language: result.language_code ? result.language_code.split('-')[0] : 'en', // Extract language from language_code
        confidence_score: result.confidence_score,
        word_count: result.word_count,
        processing_time_seconds: result.processing_time_seconds,
        service_used: result.service_used,
        created_at: result.created_at,
        updated_at: result.updated_at,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error finding transcription by ID:', error);
      throw error;
    }
  }

  /**
   * Find transcription by recording ID
   * @param recordingId Recording ID
   * @returns Transcription
   */
  public async findByRecordingId(recordingId: string): Promise<Transcription | null> {
    try {
      const query = `
        MATCH (t:Transcription)-[:TRANSCRIBES]->(r:AudioRecording {recording_id: $recordingId})-[:BELONGS_TO]->(s:Session)
        RETURN t {
          .*,
          transcription_id: t.transcription_id,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as transcription
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { recordingId });
        return result.records.length > 0 ? result.records[0].get('transcription') : null;
      });

      if (!result) {
        return null;
      }

      // Get segments
      const segmentsQuery = `
        MATCH (s:TranscriptionSegment)-[:PART_OF]->(t:Transcription)-[:TRANSCRIBES]->(r:AudioRecording {recording_id: $recordingId})
        OPTIONAL MATCH (s)-[:SPOKEN_BY]->(sp:Speaker)
        RETURN s {
          .*,
          segment_id: s.segment_id,
          speaker_id: sp.speaker_id,
          speaker_name: sp.name
        } as segment
        ORDER BY s.start_time
      `;

      const segments = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(segmentsQuery, { recordingId });
        return result.records.map(record => {
          const segment = record.get('segment');
          return {
            segment_id: segment.segment_id,
            start_time: segment.start_time,
            end_time: segment.end_time,
            text: segment.text,
            speaker_id: segment.speaker_id,
            speaker_name: segment.speaker_name,
            confidence_score: segment.confidence_score,
            words: segment.words
          } as TranscriptionSegment;
        });
      });

      return {
        transcription_id: result.transcription_id,
        recording_id: result.recording_id,
        session_id: result.session_id,
        full_text: result.full_text,
        segments: segments,
        language_code: result.language_code,
        language: result.language_code ? result.language_code.split('-')[0] : 'en', // Extract language from language_code
        confidence_score: result.confidence_score,
        word_count: result.word_count,
        processing_time_seconds: result.processing_time_seconds,
        service_used: result.service_used,
        created_at: result.created_at,
        updated_at: result.updated_at,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error finding transcription by recording ID:', error);
      throw error;
    }
  }

  /**
   * Create transcription
   * @param params Transcription creation parameters
   * @returns Created transcription
   */
  public async create(params: TranscriptionCreationParams): Promise<Transcription> {
    try {
      const transcriptionId = uuidv4();
      const now = new Date().toISOString();

      // Create transcription node
      const query = `
        MATCH (r:AudioRecording {recording_id: $recordingId})-[:BELONGS_TO]->(s:Session {session_id: $sessionId})
        CREATE (t:Transcription {
          transcription_id: $transcriptionId,
          full_text: "",
          language_code: "",
          confidence_score: 0,
          word_count: 0,
          processing_time_seconds: 0,
          service_used: $serviceUsed,
          created_at: $createdAt,
          updated_at: $createdAt,
          metadata: $metadata
        })-[:TRANSCRIBES]->(r)
        RETURN t {
          .*,
          transcription_id: t.transcription_id,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as transcription
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          transcriptionId,
          recordingId: params.recording_id,
          sessionId: params.session_id,
          serviceUsed: params.service_options.service,
          createdAt: now,
          metadata: {
            model_version: params.service_options.model || '',
            audio_duration: 0,
            speaker_count: params.service_options.speaker_count || 0,
            additional_info: params.service_options.additional_options || {}
          }
        });

        return result.records[0].get('transcription');
      });

      // Update the audio recording with the transcription ID
      const updateRecordingQuery = `
        MATCH (r:AudioRecording {recording_id: $recordingId})
        SET r.transcription_id = $transcriptionId, r.transcription_status = 'in_progress'
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(updateRecordingQuery, {
          recordingId: params.recording_id,
          transcriptionId
        });
      });

      return {
        transcription_id: result.transcription_id,
        recording_id: result.recording_id,
        session_id: result.session_id,
        full_text: result.full_text,
        segments: [],
        language_code: result.language_code,
        language: result.language_code ? result.language_code.split('-')[0] : 'en', // Extract language from language_code
        confidence_score: result.confidence_score,
        word_count: result.word_count,
        processing_time_seconds: result.processing_time_seconds,
        service_used: result.service_used,
        created_at: result.created_at,
        updated_at: result.updated_at,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error creating transcription:', error);
      throw error;
    }
  }

  /**
   * Update transcription
   * @param transcriptionId Transcription ID
   * @param params Transcription update parameters
   * @returns Updated transcription
   */
  public async update(transcriptionId: string, params: TranscriptionUpdateParams): Promise<Transcription> {
    try {
      const now = new Date().toISOString();

      // Build dynamic SET clause based on provided parameters
      let setClause = 't.updated_at = $updatedAt';
      const parameters: Record<string, any> = { transcriptionId, updatedAt: now };

      if (params.full_text !== undefined) {
        setClause += ', t.full_text = $fullText';
        parameters.fullText = params.full_text;
      }

      if (params.language_code !== undefined) {
        setClause += ', t.language_code = $languageCode';
        parameters.languageCode = params.language_code;
      }

      if (params.confidence_score !== undefined) {
        setClause += ', t.confidence_score = $confidenceScore';
        parameters.confidenceScore = params.confidence_score;
      }

      if (params.metadata !== undefined) {
        setClause += ', t.metadata = $metadata';
        parameters.metadata = {
          ...params.metadata
        };
      }

      const query = `
        MATCH (t:Transcription {transcription_id: $transcriptionId})-[:TRANSCRIBES]->(r:AudioRecording)-[:BELONGS_TO]->(s:Session)
        SET ${setClause}
        RETURN t {
          .*,
          transcription_id: t.transcription_id,
          recording_id: r.recording_id,
          session_id: s.session_id
        } as transcription
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, parameters);

        if (result.records.length === 0) {
          throw new Error('Transcription not found');
        }

        return result.records[0].get('transcription');
      });

      // If segments are provided, update them
      if (params.segments && params.segments.length > 0) {
        // First, delete existing segments
        const deleteSegmentsQuery = `
          MATCH (s:TranscriptionSegment)-[:PART_OF]->(t:Transcription {transcription_id: $transcriptionId})
          DETACH DELETE s
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(deleteSegmentsQuery, { transcriptionId });
        });

        // Then create new segments
        for (const segment of params.segments) {
          const segmentId = segment.segment_id || uuidv4();

          // Create segment
          const createSegmentQuery = `
            MATCH (t:Transcription {transcription_id: $transcriptionId})
            CREATE (s:TranscriptionSegment {
              segment_id: $segmentId,
              start_time: $startTime,
              end_time: $endTime,
              text: $text,
              confidence_score: $confidenceScore,
              words: $words
            })-[:PART_OF]->(t)
            RETURN s.segment_id
          `;

          await this.dbService.writeTransaction(async (tx) => {
            await tx.run(createSegmentQuery, {
              transcriptionId,
              segmentId,
              startTime: segment.start_time,
              endTime: segment.end_time,
              text: segment.text,
              confidenceScore: segment.confidence_score,
              words: segment.words || []
            });
          });

          // If speaker information is provided, create or link to speaker
          if (segment.speaker_id) {
            const linkSpeakerQuery = `
              MATCH (s:TranscriptionSegment {segment_id: $segmentId})
              MATCH (sp:Speaker {speaker_id: $speakerId})
              MERGE (s)-[:SPOKEN_BY]->(sp)
            `;

            await this.dbService.writeTransaction(async (tx) => {
              await tx.run(linkSpeakerQuery, {
                segmentId,
                speakerId: segment.speaker_id
              });
            });
          }
        }

        // Update word count
        const wordCount = params.segments.reduce((count, segment) => {
          return count + segment.text.split(/\s+/).filter(Boolean).length;
        }, 0);

        const updateWordCountQuery = `
          MATCH (t:Transcription {transcription_id: $transcriptionId})
          SET t.word_count = $wordCount
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(updateWordCountQuery, {
            transcriptionId,
            wordCount
          });
        });
      }

      // Get updated transcription with segments
      return await this.findById(transcriptionId) as Transcription;
    } catch (error) {
      console.error('Error updating transcription:', error);
      throw error;
    }
  }

  /**
   * Delete transcription
   * @param transcriptionId Transcription ID
   * @returns True if deleted
   */
  public async delete(transcriptionId: string): Promise<boolean> {
    try {
      // First get the recording ID
      const getRecordingQuery = `
        MATCH (t:Transcription {transcription_id: $transcriptionId})-[:TRANSCRIBES]->(r:AudioRecording)
        RETURN r.recording_id as recordingId
      `;

      const recordingId = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(getRecordingQuery, { transcriptionId });
        return result.records.length > 0 ? result.records[0].get('recordingId') : null;
      });

      if (recordingId) {
        // Update the recording to remove the transcription reference
        const updateRecordingQuery = `
          MATCH (r:AudioRecording {recording_id: $recordingId})
          SET r.transcription_id = null, r.transcription_status = 'not_started'
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(updateRecordingQuery, { recordingId });
        });
      }

      // Delete all segments
      const deleteSegmentsQuery = `
        MATCH (s:TranscriptionSegment)-[:PART_OF]->(t:Transcription {transcription_id: $transcriptionId})
        DETACH DELETE s
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(deleteSegmentsQuery, { transcriptionId });
      });

      // Delete the transcription
      const deleteQuery = `
        MATCH (t:Transcription {transcription_id: $transcriptionId})
        DETACH DELETE t
        RETURN true as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(deleteQuery, { transcriptionId });
        return result.records.length > 0 ? result.records[0].get('deleted') : false;
      });

      return result;
    } catch (error) {
      console.error('Error deleting transcription:', error);
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
    try {
      const id = speakerId || uuidv4();
      const now = new Date().toISOString();

      // Check if speaker exists
      const checkQuery = `
        MATCH (s:Speaker {speaker_id: $speakerId})
        RETURN s
      `;

      const speakerExists = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(checkQuery, { speakerId: id });
        return result.records.length > 0;
      });

      let query: string;
      if (speakerExists) {
        // Update existing speaker
        query = `
          MATCH (s:Speaker {speaker_id: $speakerId})
          SET s.name = $name, s.updated_at = $updatedAt
        `;

        if (characterId) {
          query += `
            WITH s
            OPTIONAL MATCH (s)-[r:REPRESENTS]->(:Character)
            DELETE r
            WITH s
            MATCH (c:Character {character_id: $characterId})
            MERGE (s)-[:REPRESENTS]->(c)
          `;
        }

        if (userId) {
          query += `
            WITH s
            OPTIONAL MATCH (s)-[r:IS_USER]->(:User)
            DELETE r
            WITH s
            MATCH (u:User {user_id: $userId})
            MERGE (s)-[:IS_USER]->(u)
          `;
        }

        query += `
          RETURN s {
            .*,
            speaker_id: s.speaker_id
          } as speaker
        `;

        const result = await this.dbService.writeTransaction(async (tx) => {
          const result = await tx.run(query, {
            speakerId: id,
            name,
            characterId,
            userId,
            updatedAt: now
          });
          return result.records[0].get('speaker');
        });

        return {
          speaker_id: result.speaker_id,
          speaker_name: result.name,
          character_id: characterId,
          user_id: userId,
          confidence_score: 1.0
        };
      } else {
        // Create new speaker
        query = `
          CREATE (s:Speaker {
            speaker_id: $speakerId,
            name: $name,
            created_at: $createdAt,
            updated_at: $createdAt
          })
        `;

        if (characterId) {
          query += `
            WITH s
            MATCH (c:Character {character_id: $characterId})
            MERGE (s)-[:REPRESENTS]->(c)
          `;
        }

        if (userId) {
          query += `
            WITH s
            MATCH (u:User {user_id: $userId})
            MERGE (s)-[:IS_USER]->(u)
          `;
        }

        query += `
          RETURN s {
            .*,
            speaker_id: s.speaker_id
          } as speaker
        `;

        const result = await this.dbService.writeTransaction(async (tx) => {
          const result = await tx.run(query, {
            speakerId: id,
            name,
            characterId,
            userId,
            createdAt: now
          });
          return result.records[0].get('speaker');
        });

        return {
          speaker_id: result.speaker_id,
          speaker_name: result.name,
          character_id: characterId,
          user_id: userId,
          confidence_score: 1.0
        };
      }
    } catch (error) {
      console.error('Error creating or updating speaker:', error);
      throw error;
    }
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
    try {
      const now = new Date().toISOString();

      // Build dynamic SET clause based on provided parameters
      let setClause = 's.updated_at = $updatedAt';
      const parameters: Record<string, any> = { speakerId, updatedAt: now };

      if (params.speaker_name !== undefined) {
        setClause += ', s.name = $speakerName';
        parameters.speakerName = params.speaker_name;
      }

      let query = `
        MATCH (s:Speaker {speaker_id: $speakerId})
        SET ${setClause}
      `;

      // Handle character relationship
      if (params.character_id !== undefined) {
        query += `
          WITH s
          OPTIONAL MATCH (s)-[r:REPRESENTS]->(:Character)
          DELETE r
        `;

        if (params.character_id) {
          query += `
            WITH s
            MATCH (c:Character {character_id: $characterId})
            MERGE (s)-[:REPRESENTS]->(c)
          `;
          parameters.characterId = params.character_id;
        }
      }

      // Handle user relationship
      if (params.user_id !== undefined) {
        query += `
          WITH s
          OPTIONAL MATCH (s)-[r:IS_USER]->(:User)
          DELETE r
        `;

        if (params.user_id) {
          query += `
            WITH s
            MATCH (u:User {user_id: $userId})
            MERGE (s)-[:IS_USER]->(u)
          `;
          parameters.userId = params.user_id;
        }
      }

      query += `
        RETURN s {
          .*,
          speaker_id: s.speaker_id
        } as speaker
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, parameters);

        if (result.records.length === 0) {
          throw new Error('Speaker not found');
        }

        return result.records[0].get('speaker');
      });

      // Get character ID if exists
      const characterQuery = `
        MATCH (s:Speaker {speaker_id: $speakerId})-[:REPRESENTS]->(c:Character)
        RETURN c.character_id as characterId
      `;

      const characterId = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(characterQuery, { speakerId });
        return result.records.length > 0 ? result.records[0].get('characterId') : null;
      });

      // Get user ID if exists
      const userQuery = `
        MATCH (s:Speaker {speaker_id: $speakerId})-[:IS_USER]->(u:User)
        RETURN u.user_id as userId
      `;

      const userId = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(userQuery, { speakerId });
        return result.records.length > 0 ? result.records[0].get('userId') : null;
      });

      return {
        speaker_id: result.speaker_id,
        speaker_name: result.name,
        character_id: characterId,
        user_id: userId,
        confidence_score: 1.0
      };
    } catch (error) {
      console.error('Error updating speaker identification:', error);
      throw error;
    }
  }

  /**
   * Get all speakers for a session
   * @param sessionId Session ID
   * @returns Speaker identifications
   */
  public async getSpeakersForSession(sessionId: string): Promise<SpeakerIdentification[]> {
    try {
      const query = `
        MATCH (s:Speaker)-[:SPOKEN_BY]-(seg:TranscriptionSegment)-[:PART_OF]->(t:Transcription)-[:TRANSCRIBES]->(r:AudioRecording)-[:BELONGS_TO]->(ses:Session {session_id: $sessionId})
        OPTIONAL MATCH (s)-[:REPRESENTS]->(c:Character)
        OPTIONAL MATCH (s)-[:IS_USER]->(u:User)
        RETURN DISTINCT s.speaker_id as speakerId, s.name as speakerName, c.character_id as characterId, u.user_id as userId
      `;

      const results = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records.map(record => {
          return {
            speaker_id: record.get('speakerId'),
            speaker_name: record.get('speakerName'),
            character_id: record.get('characterId'),
            user_id: record.get('userId'),
            confidence_score: 1.0
          } as SpeakerIdentification;
        });
      });

      return results;
    } catch (error) {
      console.error('Error getting speakers for session:', error);
      throw error;
    }
  }
}
