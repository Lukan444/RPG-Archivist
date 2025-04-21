import { BaseRepository } from './base.repository';
import { DatabaseService } from '../services/database.service';
import { 
  SessionAnalysis, 
  SessionAnalysisCreationParams, 
  SessionAnalysisUpdateParams,
  KeyPoint,
  CharacterInsight,
  PlotDevelopment,
  SentimentAnalysis,
  Topic
} from '../models/session-analysis.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for managing session analyses
 */
export class SessionAnalysisRepository extends BaseRepository {
  constructor(dbService: DatabaseService) {
    super(dbService);
  }

  /**
   * Find session analysis by ID
   * @param analysisId Analysis ID
   * @returns Session analysis
   */
  public async findById(analysisId: string): Promise<SessionAnalysis | null> {
    try {
      const query = `
        MATCH (a:SessionAnalysis {analysis_id: $analysisId})-[:ANALYZES]->(s:Session)
        MATCH (a)-[:BASED_ON]->(t:Transcription)
        RETURN a {
          .*,
          analysis_id: a.analysis_id,
          session_id: s.session_id,
          transcription_id: t.transcription_id
        } as analysis
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { analysisId });
        return result.records.length > 0 ? result.records[0].get('analysis') : null;
      });

      if (!result) {
        return null;
      }

      // Get key points
      const keyPointsQuery = `
        MATCH (k:KeyPoint)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
        RETURN k {.*} as keyPoint
        ORDER BY k.importance_score DESC
      `;

      const keyPoints = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(keyPointsQuery, { analysisId });
        return result.records.map(record => record.get('keyPoint') as KeyPoint);
      });

      // Get character insights
      const characterInsightsQuery = `
        MATCH (c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
        OPTIONAL MATCH (c)-[:REFERS_TO]->(ch:Character)
        OPTIONAL MATCH (c)-[:REFERS_TO]->(sp:Speaker)
        RETURN c {
          .*,
          character_id: ch.character_id,
          speaker_id: sp.speaker_id
        } as characterInsight
        ORDER BY c.participation_score DESC
      `;

      const characterInsights = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(characterInsightsQuery, { analysisId });
        return result.records.map(record => {
          const insight = record.get('characterInsight') as CharacterInsight;
          
          // Get character interactions
          const interactionsQuery = `
            MATCH (i:CharacterInteraction)-[:PART_OF]->(c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
            WHERE id(c) = $characterInsightId
            OPTIONAL MATCH (i)-[:REFERS_TO]->(ch:Character)
            OPTIONAL MATCH (i)-[:REFERS_TO]->(sp:Speaker)
            RETURN i {
              .*,
              character_id: ch.character_id,
              speaker_id: sp.speaker_id
            } as interaction
            ORDER BY i.interaction_count DESC
          `;
          
          return this.dbService.readTransaction(async (tx) => {
            const interactionsResult = await tx.run(interactionsQuery, { 
              analysisId, 
              characterInsightId: insight.id 
            });
            
            insight.key_interactions = interactionsResult.records.map(record => 
              record.get('interaction')
            );
            
            return insight;
          });
        });
      });

      // Get plot developments
      const plotDevelopmentsQuery = `
        MATCH (p:PlotDevelopment)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
        RETURN p {.*} as plotDevelopment
        ORDER BY p.importance_score DESC
      `;

      const plotDevelopments = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(plotDevelopmentsQuery, { analysisId });
        return result.records.map(record => {
          const development = record.get('plotDevelopment') as PlotDevelopment;
          
          // Get related entities
          const entitiesQuery = `
            MATCH (e:RelatedEntity)-[:PART_OF]->(p:PlotDevelopment)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
            WHERE id(p) = $plotDevelopmentId
            RETURN e {.*} as entity
            ORDER BY e.relevance_score DESC
          `;
          
          return this.dbService.readTransaction(async (tx) => {
            const entitiesResult = await tx.run(entitiesQuery, { 
              analysisId, 
              plotDevelopmentId: development.id 
            });
            
            development.related_entities = entitiesResult.records.map(record => 
              record.get('entity')
            );
            
            return development;
          });
        });
      });

      // Get topics
      const topicsQuery = `
        MATCH (tp:Topic)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
        RETURN tp {.*} as topic
        ORDER BY tp.relevance_score DESC
      `;

      const topics = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(topicsQuery, { analysisId });
        return result.records.map(record => record.get('topic') as Topic);
      });

      return {
        analysis_id: result.analysis_id,
        session_id: result.session_id,
        transcription_id: result.transcription_id,
        created_at: result.created_at,
        updated_at: result.updated_at,
        summary: result.summary,
        key_points: keyPoints,
        character_insights: await Promise.all(characterInsights),
        plot_developments: await Promise.all(plotDevelopments),
        sentiment_analysis: result.sentiment_analysis as SentimentAnalysis,
        topics: topics,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error finding session analysis by ID:', error);
      throw error;
    }
  }

  /**
   * Find session analysis by session ID
   * @param sessionId Session ID
   * @returns Session analysis
   */
  public async findBySessionId(sessionId: string): Promise<SessionAnalysis | null> {
    try {
      const query = `
        MATCH (a:SessionAnalysis)-[:ANALYZES]->(s:Session {session_id: $sessionId})
        RETURN a.analysis_id as analysisId
      `;

      const analysisId = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records.length > 0 ? result.records[0].get('analysisId') : null;
      });

      if (!analysisId) {
        return null;
      }

      return this.findById(analysisId);
    } catch (error) {
      console.error('Error finding session analysis by session ID:', error);
      throw error;
    }
  }

  /**
   * Find session analysis by transcription ID
   * @param transcriptionId Transcription ID
   * @returns Session analysis
   */
  public async findByTranscriptionId(transcriptionId: string): Promise<SessionAnalysis | null> {
    try {
      const query = `
        MATCH (a:SessionAnalysis)-[:BASED_ON]->(t:Transcription {transcription_id: $transcriptionId})
        RETURN a.analysis_id as analysisId
      `;

      const analysisId = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { transcriptionId });
        return result.records.length > 0 ? result.records[0].get('analysisId') : null;
      });

      if (!analysisId) {
        return null;
      }

      return this.findById(analysisId);
    } catch (error) {
      console.error('Error finding session analysis by transcription ID:', error);
      throw error;
    }
  }

  /**
   * Create session analysis
   * @param params Session analysis creation parameters
   * @returns Created session analysis
   */
  public async create(params: SessionAnalysisCreationParams): Promise<SessionAnalysis> {
    try {
      const analysisId = uuidv4();
      const now = new Date().toISOString();

      // Create session analysis node
      const query = `
        MATCH (s:Session {session_id: $sessionId})
        MATCH (t:Transcription {transcription_id: $transcriptionId})
        CREATE (a:SessionAnalysis {
          analysis_id: $analysisId,
          created_at: $createdAt,
          updated_at: $createdAt,
          summary: "",
          sentiment_analysis: {
            overall_sentiment: 0,
            sentiment_distribution: {
              positive: 0,
              neutral: 0,
              negative: 0
            },
            sentiment_timeline: []
          },
          metadata: {
            model_version: "",
            processing_time_seconds: 0,
            word_count: 0,
            confidence_score: 0
          }
        })-[:ANALYZES]->(s)
        CREATE (a)-[:BASED_ON]->(t)
        RETURN a {
          .*,
          analysis_id: a.analysis_id,
          session_id: s.session_id,
          transcription_id: t.transcription_id
        } as analysis
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          analysisId,
          sessionId: params.session_id,
          transcriptionId: params.transcription_id,
          createdAt: now
        });

        return result.records[0].get('analysis');
      });

      return {
        analysis_id: result.analysis_id,
        session_id: result.session_id,
        transcription_id: result.transcription_id,
        created_at: result.created_at,
        updated_at: result.updated_at,
        summary: result.summary,
        key_points: [],
        character_insights: [],
        plot_developments: [],
        sentiment_analysis: result.sentiment_analysis,
        topics: [],
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error creating session analysis:', error);
      throw error;
    }
  }

  /**
   * Update session analysis
   * @param analysisId Analysis ID
   * @param params Session analysis update parameters
   * @returns Updated session analysis
   */
  public async update(analysisId: string, params: SessionAnalysisUpdateParams): Promise<SessionAnalysis> {
    try {
      const now = new Date().toISOString();

      // Build dynamic SET clause based on provided parameters
      let setClause = 'a.updated_at = $updatedAt';
      const parameters: Record<string, any> = { analysisId, updatedAt: now };

      if (params.summary !== undefined) {
        setClause += ', a.summary = $summary';
        parameters.summary = params.summary;
      }

      if (params.sentiment_analysis !== undefined) {
        setClause += ', a.sentiment_analysis = $sentimentAnalysis';
        parameters.sentimentAnalysis = params.sentiment_analysis;
      }

      if (params.metadata !== undefined) {
        setClause += ', a.metadata = $metadata';
        parameters.metadata = {
          ...params.metadata
        };
      }

      const query = `
        MATCH (a:SessionAnalysis {analysis_id: $analysisId})-[:ANALYZES]->(s:Session)
        MATCH (a)-[:BASED_ON]->(t:Transcription)
        SET ${setClause}
        RETURN a {
          .*,
          analysis_id: a.analysis_id,
          session_id: s.session_id,
          transcription_id: t.transcription_id
        } as analysis
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, parameters);

        if (result.records.length === 0) {
          throw new Error('Session analysis not found');
        }

        return result.records[0].get('analysis');
      });

      // Update key points if provided
      if (params.key_points !== undefined) {
        // First, delete existing key points
        const deleteKeyPointsQuery = `
          MATCH (k:KeyPoint)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
          DETACH DELETE k
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(deleteKeyPointsQuery, { analysisId });
        });

        // Then create new key points
        for (const keyPoint of params.key_points) {
          const keyPointId = keyPoint.key_point_id || uuidv4();
          
          const createKeyPointQuery = `
            MATCH (a:SessionAnalysis {analysis_id: $analysisId})
            CREATE (k:KeyPoint {
              key_point_id: $keyPointId,
              text: $text,
              segment_ids: $segmentIds,
              importance_score: $importanceScore,
              category: $category
            })-[:PART_OF]->(a)
            RETURN k.key_point_id
          `;

          await this.dbService.writeTransaction(async (tx) => {
            await tx.run(createKeyPointQuery, {
              analysisId,
              keyPointId,
              text: keyPoint.text,
              segmentIds: keyPoint.segment_ids,
              importanceScore: keyPoint.importance_score,
              category: keyPoint.category
            });
          });
        }
      }

      // Update character insights if provided
      if (params.character_insights !== undefined) {
        // First, delete existing character insights
        const deleteCharacterInsightsQuery = `
          MATCH (c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
          DETACH DELETE c
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(deleteCharacterInsightsQuery, { analysisId });
        });

        // Then create new character insights
        for (const insight of params.character_insights) {
          const createInsightQuery = `
            MATCH (a:SessionAnalysis {analysis_id: $analysisId})
            CREATE (c:CharacterInsight {
              name: $name,
              participation_score: $participationScore,
              sentiment_score: $sentimentScore,
              topics_of_interest: $topicsOfInterest,
              notable_quotes: $notableQuotes
            })-[:PART_OF]->(a)
          `;

          const insightParams = {
            analysisId,
            name: insight.name,
            participationScore: insight.participation_score,
            sentimentScore: insight.sentiment_score,
            topicsOfInterest: insight.topics_of_interest,
            notableQuotes: insight.notable_quotes
          };

          const insightResult = await this.dbService.writeTransaction(async (tx) => {
            const result = await tx.run(createInsightQuery, insightParams);
            return result;
          });

          // Link to character if provided
          if (insight.character_id) {
            const linkCharacterQuery = `
              MATCH (c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
              WHERE c.name = $name
              MATCH (ch:Character {character_id: $characterId})
              CREATE (c)-[:REFERS_TO]->(ch)
            `;

            await this.dbService.writeTransaction(async (tx) => {
              await tx.run(linkCharacterQuery, {
                analysisId,
                name: insight.name,
                characterId: insight.character_id
              });
            });
          }

          // Link to speaker if provided
          if (insight.speaker_id) {
            const linkSpeakerQuery = `
              MATCH (c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
              WHERE c.name = $name
              MATCH (sp:Speaker {speaker_id: $speakerId})
              CREATE (c)-[:REFERS_TO]->(sp)
            `;

            await this.dbService.writeTransaction(async (tx) => {
              await tx.run(linkSpeakerQuery, {
                analysisId,
                name: insight.name,
                speakerId: insight.speaker_id
              });
            });
          }

          // Create character interactions
          if (insight.key_interactions && insight.key_interactions.length > 0) {
            for (const interaction of insight.key_interactions) {
              const createInteractionQuery = `
                MATCH (c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
                WHERE c.name = $characterName
                CREATE (i:CharacterInteraction {
                  name: $name,
                  interaction_count: $interactionCount,
                  sentiment_score: $sentimentScore,
                  context: $context
                })-[:PART_OF]->(c)
              `;

              await this.dbService.writeTransaction(async (tx) => {
                await tx.run(createInteractionQuery, {
                  analysisId,
                  characterName: insight.name,
                  name: interaction.name,
                  interactionCount: interaction.interaction_count,
                  sentimentScore: interaction.sentiment_score,
                  context: interaction.context
                });
              });

              // Link to character if provided
              if (interaction.character_id) {
                const linkCharacterQuery = `
                  MATCH (i:CharacterInteraction)-[:PART_OF]->(c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
                  WHERE c.name = $characterName AND i.name = $interactionName
                  MATCH (ch:Character {character_id: $characterId})
                  CREATE (i)-[:REFERS_TO]->(ch)
                `;

                await this.dbService.writeTransaction(async (tx) => {
                  await tx.run(linkCharacterQuery, {
                    analysisId,
                    characterName: insight.name,
                    interactionName: interaction.name,
                    characterId: interaction.character_id
                  });
                });
              }

              // Link to speaker if provided
              if (interaction.speaker_id) {
                const linkSpeakerQuery = `
                  MATCH (i:CharacterInteraction)-[:PART_OF]->(c:CharacterInsight)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
                  WHERE c.name = $characterName AND i.name = $interactionName
                  MATCH (sp:Speaker {speaker_id: $speakerId})
                  CREATE (i)-[:REFERS_TO]->(sp)
                `;

                await this.dbService.writeTransaction(async (tx) => {
                  await tx.run(linkSpeakerQuery, {
                    analysisId,
                    characterName: insight.name,
                    interactionName: interaction.name,
                    speakerId: interaction.speaker_id
                  });
                });
              }
            }
          }
        }
      }

      // Update plot developments if provided
      if (params.plot_developments !== undefined) {
        // First, delete existing plot developments
        const deletePlotDevelopmentsQuery = `
          MATCH (p:PlotDevelopment)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
          DETACH DELETE p
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(deletePlotDevelopmentsQuery, { analysisId });
        });

        // Then create new plot developments
        for (const development of params.plot_developments) {
          const developmentId = development.plot_development_id || uuidv4();
          
          const createDevelopmentQuery = `
            MATCH (a:SessionAnalysis {analysis_id: $analysisId})
            CREATE (p:PlotDevelopment {
              plot_development_id: $developmentId,
              title: $title,
              description: $description,
              segment_ids: $segmentIds,
              importance_score: $importanceScore
            })-[:PART_OF]->(a)
            RETURN p.plot_development_id
          `;

          await this.dbService.writeTransaction(async (tx) => {
            await tx.run(createDevelopmentQuery, {
              analysisId,
              developmentId,
              title: development.title,
              description: development.description,
              segmentIds: development.segment_ids,
              importanceScore: development.importance_score
            });
          });

          // Create related entities
          if (development.related_entities && development.related_entities.length > 0) {
            for (const entity of development.related_entities) {
              const createEntityQuery = `
                MATCH (p:PlotDevelopment {plot_development_id: $developmentId})-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
                CREATE (e:RelatedEntity {
                  entity_id: $entityId,
                  entity_type: $entityType,
                  name: $name,
                  relevance_score: $relevanceScore
                })-[:PART_OF]->(p)
              `;

              await this.dbService.writeTransaction(async (tx) => {
                await tx.run(createEntityQuery, {
                  analysisId,
                  developmentId,
                  entityId: entity.entity_id,
                  entityType: entity.entity_type,
                  name: entity.name,
                  relevanceScore: entity.relevance_score
                });
              });
            }
          }
        }
      }

      // Update topics if provided
      if (params.topics !== undefined) {
        // First, delete existing topics
        const deleteTopicsQuery = `
          MATCH (t:Topic)-[:PART_OF]->(a:SessionAnalysis {analysis_id: $analysisId})
          DETACH DELETE t
        `;

        await this.dbService.writeTransaction(async (tx) => {
          await tx.run(deleteTopicsQuery, { analysisId });
        });

        // Then create new topics
        for (const topic of params.topics) {
          const topicId = topic.topic_id || uuidv4();
          
          const createTopicQuery = `
            MATCH (a:SessionAnalysis {analysis_id: $analysisId})
            CREATE (t:Topic {
              topic_id: $topicId,
              name: $name,
              keywords: $keywords,
              relevance_score: $relevanceScore,
              segment_ids: $segmentIds
            })-[:PART_OF]->(a)
            RETURN t.topic_id
          `;

          await this.dbService.writeTransaction(async (tx) => {
            await tx.run(createTopicQuery, {
              analysisId,
              topicId,
              name: topic.name,
              keywords: topic.keywords,
              relevanceScore: topic.relevance_score,
              segmentIds: topic.segment_ids
            });
          });
        }
      }

      // Get updated session analysis
      return this.findById(analysisId) as Promise<SessionAnalysis>;
    } catch (error) {
      console.error('Error updating session analysis:', error);
      throw error;
    }
  }

  /**
   * Delete session analysis
   * @param analysisId Analysis ID
   * @returns True if deleted
   */
  public async delete(analysisId: string): Promise<boolean> {
    try {
      // Delete all related nodes
      const deleteRelatedNodesQuery = `
        MATCH (a:SessionAnalysis {analysis_id: $analysisId})
        OPTIONAL MATCH (k:KeyPoint)-[:PART_OF]->(a)
        OPTIONAL MATCH (c:CharacterInsight)-[:PART_OF]->(a)
        OPTIONAL MATCH (i:CharacterInteraction)-[:PART_OF]->(c)
        OPTIONAL MATCH (p:PlotDevelopment)-[:PART_OF]->(a)
        OPTIONAL MATCH (e:RelatedEntity)-[:PART_OF]->(p)
        OPTIONAL MATCH (t:Topic)-[:PART_OF]->(a)
        DETACH DELETE k, i, c, e, p, t
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(deleteRelatedNodesQuery, { analysisId });
      });

      // Delete the analysis node
      const deleteQuery = `
        MATCH (a:SessionAnalysis {analysis_id: $analysisId})
        DETACH DELETE a
        RETURN true as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(deleteQuery, { analysisId });
        return result.records.length > 0 ? result.records[0].get('deleted') : false;
      });

      return result;
    } catch (error) {
      console.error('Error deleting session analysis:', error);
      throw error;
    }
  }
}
