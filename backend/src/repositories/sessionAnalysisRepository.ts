import { Driver } from 'neo4j-driver';
import { SessionAnalysis } from '../models/session-analysis.model';
import { v4 as uuidv4 } from 'uuid';

export class SessionAnalysisRepository {
  private driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  /**
   * Create a new session analysis
   * @param sessionAnalysis Session analysis to create
   * @returns Created session analysis
   */
  async create(sessionAnalysis: SessionAnalysis): Promise<SessionAnalysis> {
    const session = this.driver.session();

    try {
      // Generate ID if not provided
      if (!sessionAnalysis.analysis_id) {
        sessionAnalysis.analysis_id = uuidv4();
      }

      // Create session analysis node
      const result = await session.run(
        `
        CREATE (a:SessionAnalysis {
          analysis_id: $analysis_id,
          session_id: $session_id,
          transcription_id: $transcription_id,
          recording_id: $recording_id,
          created_by: $created_by,
          created_at: $created_at,
          updated_at: $updated_at,
          status: $status
        })

        WITH a

        MATCH (s:Session {session_id: $session_id})
        MATCH (t:Transcription {transcription_id: $transcription_id})
        MATCH (r:AudioRecording {recording_id: $recording_id})

        CREATE (a)-[:ANALYZES]->(s)
        CREATE (a)-[:BASED_ON]->(t)
        CREATE (a)-[:FOR_RECORDING]->(r)

        RETURN a
        `,
        {
          analysis_id: sessionAnalysis.analysis_id,
          session_id: sessionAnalysis.session_id,
          transcription_id: sessionAnalysis.transcription_id,
          recording_id: sessionAnalysis.recording_id,
          created_by: sessionAnalysis.created_by,
          created_at: sessionAnalysis.created_at,
          updated_at: sessionAnalysis.updated_at,
          status: sessionAnalysis.status
        }
      );

      // Return created session analysis
      const record = result.records[0];
      if (!record) {
        throw new Error('Failed to create session analysis');
      }

      return {
        ...sessionAnalysis,
        analysis_id: sessionAnalysis.analysis_id
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get session analysis by ID
   * @param analysisId Analysis ID
   * @returns Session analysis
   */
  async getById(analysisId: string): Promise<SessionAnalysis | null> {
    const session = this.driver.session();

    try {
      // Get session analysis
      const result = await session.run(
        `
        MATCH (a:SessionAnalysis {analysis_id: $analysis_id})
        OPTIONAL MATCH (a)-[:BASED_ON]->(t:Transcription)
        RETURN a, t
        `,
        { analysis_id: analysisId }
      );

      // Return session analysis
      const record = result.records[0];
      if (!record) {
        return null;
      }

      const analysisNode = record.get('a').properties;
      const transcriptionNode = record.get('t')?.properties;

      return {
        ...analysisNode,
        transcription: transcriptionNode ? {
          transcription_id: transcriptionNode.transcription_id,
          segments: transcriptionNode.segments || []
        } : null
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get session analysis by session ID
   * @param sessionId Session ID
   * @returns Session analysis
   */
  async getBySessionId(sessionId: string): Promise<SessionAnalysis | null> {
    const session = this.driver.session();

    try {
      // Get session analysis
      const result = await session.run(
        `
        MATCH (a:SessionAnalysis)-[:ANALYZES]->(s:Session {session_id: $session_id})
        OPTIONAL MATCH (a)-[:BASED_ON]->(t:Transcription)
        RETURN a, t
        ORDER BY a.created_at DESC
        LIMIT 1
        `,
        { session_id: sessionId }
      );

      // Return session analysis
      const record = result.records[0];
      if (!record) {
        return null;
      }

      const analysisNode = record.get('a').properties;
      const transcriptionNode = record.get('t')?.properties;

      return {
        ...analysisNode,
        transcription: transcriptionNode ? {
          transcription_id: transcriptionNode.transcription_id,
          segments: transcriptionNode.segments || []
        } : null
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get session analysis by transcription ID
   * @param transcriptionId Transcription ID
   * @returns Session analysis
   */
  async getByTranscriptionId(transcriptionId: string): Promise<SessionAnalysis | null> {
    const session = this.driver.session();

    try {
      // Get session analysis
      const result = await session.run(
        `
        MATCH (a:SessionAnalysis)-[:BASED_ON]->(t:Transcription {transcription_id: $transcription_id})
        RETURN a, t
        ORDER BY a.created_at DESC
        LIMIT 1
        `,
        { transcription_id: transcriptionId }
      );

      // Return session analysis
      const record = result.records[0];
      if (!record) {
        return null;
      }

      const analysisNode = record.get('a').properties;
      const transcriptionNode = record.get('t')?.properties;

      return {
        ...analysisNode,
        transcription: transcriptionNode ? {
          transcription_id: transcriptionNode.transcription_id,
          segments: transcriptionNode.segments || []
        } : null
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Update session analysis
   * @param sessionAnalysis Session analysis to update
   * @returns Updated session analysis
   */
  async update(sessionAnalysis: SessionAnalysis): Promise<SessionAnalysis> {
    const session = this.driver.session();

    try {
      // Update session analysis
      const result = await session.run(
        `
        MATCH (a:SessionAnalysis {analysis_id: $analysis_id})

        SET a.status = $status,
            a.updated_at = $updated_at,
            a.summary = $summary,
            a.key_points = $key_points,
            a.character_insights = $character_insights,
            a.plot_developments = $plot_developments,
            a.sentiment_analysis = $sentiment_analysis,
            a.topics = $topics,
            a.metadata = $metadata,
            a.error = $error

        RETURN a
        `,
        {
          analysis_id: sessionAnalysis.analysis_id,
          status: sessionAnalysis.status,
          updated_at: sessionAnalysis.updated_at,
          summary: sessionAnalysis.summary || null,
          key_points: sessionAnalysis.key_points ? JSON.stringify(sessionAnalysis.key_points) : null,
          character_insights: sessionAnalysis.character_insights ? JSON.stringify(sessionAnalysis.character_insights) : null,
          plot_developments: sessionAnalysis.plot_developments ? JSON.stringify(sessionAnalysis.plot_developments) : null,
          sentiment_analysis: sessionAnalysis.sentiment_analysis ? JSON.stringify(sessionAnalysis.sentiment_analysis) : null,
          topics: sessionAnalysis.topics ? JSON.stringify(sessionAnalysis.topics) : null,
          metadata: sessionAnalysis.metadata ? JSON.stringify(sessionAnalysis.metadata) : null,
          error: sessionAnalysis.error || null
        }
      );

      // Return updated session analysis
      const record = result.records[0];
      if (!record) {
        throw new Error('Failed to update session analysis');
      }

      return sessionAnalysis;
    } finally {
      await session.close();
    }
  }

  /**
   * Delete session analysis
   * @param analysisId Analysis ID
   * @returns Success status
   */
  async delete(analysisId: string): Promise<boolean> {
    const session = this.driver.session();

    try {
      // Delete session analysis
      const result = await session.run(
        `
        MATCH (a:SessionAnalysis {analysis_id: $analysis_id})
        DETACH DELETE a
        `,
        { analysis_id: analysisId }
      );

      return true;
    } finally {
      await session.close();
    }
  }
}
