import { DatabaseService } from '../services/database.service';
import {
  ContentSuggestion,
  SuggestionType,
  SuggestionStatus,
  ConfidenceLevel,
  ContentAnalysisFilterOptions,
  ContentAnalysisResult,
  CharacterSuggestion,
  LocationSuggestion,
  RelationshipSuggestion,
  LoreSuggestion,
  DialogSuggestion,
  EventSuggestion,
  NoteSuggestion
} from '../models/content-analysis.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for content analysis
 */
export class ContentAnalysisRepository {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Create a new content suggestion
   * @param suggestion Content suggestion
   * @returns Created suggestion
   */
  public async createSuggestion(suggestion: Omit<ContentSuggestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentSuggestion> {
    try {
      const now = Date.now();
      const suggestionId = uuidv4();
      
      const newSuggestion: ContentSuggestion = {
        ...suggestion,
        id: suggestionId,
        createdAt: now,
        updatedAt: now
      };

      const query = `
        CREATE (s:ContentSuggestion $suggestion)
        RETURN s {.*} as suggestion
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { suggestion: newSuggestion });
        return result.records[0].get('suggestion');
      });

      // Create relationships if source or context is provided
      if (newSuggestion.sourceId) {
        await this.linkSuggestionToSource(newSuggestion);
      }

      if (newSuggestion.contextId) {
        await this.linkSuggestionToContext(newSuggestion);
      }

      return result;
    } catch (error) {
      console.error('Error creating content suggestion:', error);
      throw error;
    }
  }

  /**
   * Link suggestion to source
   * @param suggestion Content suggestion
   */
  private async linkSuggestionToSource(suggestion: ContentSuggestion): Promise<void> {
    try {
      const query = `
        MATCH (s:ContentSuggestion {id: $suggestionId})
        MATCH (e) WHERE e.id = $sourceId
        CREATE (s)-[:DERIVED_FROM]->(e)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { 
          suggestionId: suggestion.id, 
          sourceId: suggestion.sourceId 
        });
      });
    } catch (error) {
      console.error('Error linking suggestion to source:', error);
      throw error;
    }
  }

  /**
   * Link suggestion to context
   * @param suggestion Content suggestion
   */
  private async linkSuggestionToContext(suggestion: ContentSuggestion): Promise<void> {
    try {
      const query = `
        MATCH (s:ContentSuggestion {id: $suggestionId})
        MATCH (c) WHERE c.id = $contextId
        CREATE (s)-[:HAS_CONTEXT]->(c)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { 
          suggestionId: suggestion.id, 
          contextId: suggestion.contextId 
        });
      });
    } catch (error) {
      console.error('Error linking suggestion to context:', error);
      throw error;
    }
  }

  /**
   * Get content suggestion by ID
   * @param suggestionId Suggestion ID
   * @returns Content suggestion
   */
  public async getSuggestion(suggestionId: string): Promise<ContentSuggestion | null> {
    try {
      const query = `
        MATCH (s:ContentSuggestion {id: $suggestionId})
        OPTIONAL MATCH (s)-[:DERIVED_FROM]->(source)
        OPTIONAL MATCH (s)-[:HAS_CONTEXT]->(context)
        RETURN s {
          .*,
          sourceDetails: CASE WHEN source IS NOT NULL THEN {
            id: source.id,
            name: source.name,
            type: labels(source)[0]
          } ELSE NULL END,
          contextDetails: CASE WHEN context IS NOT NULL THEN {
            id: context.id,
            name: context.name,
            type: labels(context)[0]
          } ELSE NULL END
        } as suggestion
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { suggestionId });
        return result.records.length > 0 ? result.records[0].get('suggestion') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting content suggestion:', error);
      throw error;
    }
  }

  /**
   * Get all content suggestions with optional filtering
   * @param filter Filter options
   * @returns Content suggestions
   */
  public async getSuggestions(filter?: ContentAnalysisFilterOptions): Promise<ContentSuggestion[]> {
    try {
      let whereClause = '';
      const params: Record<string, any> = {};

      if (filter) {
        const conditions: string[] = [];

        if (filter.types && filter.types.length > 0) {
          conditions.push('s.type IN $types');
          params.types = filter.types;
        }

        if (filter.status && filter.status.length > 0) {
          conditions.push('s.status IN $statuses');
          params.statuses = filter.status;
        }

        if (filter.confidence && filter.confidence.length > 0) {
          conditions.push('s.confidence IN $confidences');
          params.confidences = filter.confidence;
        }

        if (filter.sourceId) {
          conditions.push('s.sourceId = $sourceId');
          params.sourceId = filter.sourceId;
        }

        if (filter.sourceType) {
          conditions.push('s.sourceType = $sourceType');
          params.sourceType = filter.sourceType;
        }

        if (filter.contextId) {
          conditions.push('s.contextId = $contextId');
          params.contextId = filter.contextId;
        }

        if (filter.contextType) {
          conditions.push('s.contextType = $contextType');
          params.contextType = filter.contextType;
        }

        if (filter.createdAfter) {
          conditions.push('s.createdAt >= $createdAfter');
          params.createdAfter = filter.createdAfter;
        }

        if (filter.createdBefore) {
          conditions.push('s.createdAt <= $createdBefore');
          params.createdBefore = filter.createdBefore;
        }

        if (filter.search) {
          conditions.push('(s.title CONTAINS $search OR s.description CONTAINS $search)');
          params.search = filter.search;
        }

        if (conditions.length > 0) {
          whereClause = 'WHERE ' + conditions.join(' AND ');
        }
      }

      const query = `
        MATCH (s:ContentSuggestion)
        ${whereClause}
        OPTIONAL MATCH (s)-[:DERIVED_FROM]->(source)
        OPTIONAL MATCH (s)-[:HAS_CONTEXT]->(context)
        RETURN s {
          .*,
          sourceDetails: CASE WHEN source IS NOT NULL THEN {
            id: source.id,
            name: source.name,
            type: labels(source)[0]
          } ELSE NULL END,
          contextDetails: CASE WHEN context IS NOT NULL THEN {
            id: context.id,
            name: context.name,
            type: labels(context)[0]
          } ELSE NULL END
        } as suggestion
        ORDER BY s.createdAt DESC
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, params);
        return result.records.map(record => record.get('suggestion'));
      });

      return result;
    } catch (error) {
      console.error('Error getting content suggestions:', error);
      throw error;
    }
  }

  /**
   * Update content suggestion
   * @param suggestionId Suggestion ID
   * @param suggestion Updated suggestion data
   * @returns Updated suggestion
   */
  public async updateSuggestion(
    suggestionId: string,
    suggestion: Partial<Omit<ContentSuggestion, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ContentSuggestion> {
    try {
      const updateData = {
        ...suggestion,
        updatedAt: Date.now()
      };

      const query = `
        MATCH (s:ContentSuggestion {id: $suggestionId})
        SET s += $updateData
        RETURN s {.*} as suggestion
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { 
          suggestionId,
          updateData
        });
        return result.records[0].get('suggestion');
      });

      return result;
    } catch (error) {
      console.error('Error updating content suggestion:', error);
      throw error;
    }
  }

  /**
   * Delete content suggestion
   * @param suggestionId Suggestion ID
   * @returns True if deleted
   */
  public async deleteSuggestion(suggestionId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (s:ContentSuggestion {id: $suggestionId})
        DETACH DELETE s
        RETURN count(s) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { suggestionId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting content suggestion:', error);
      throw error;
    }
  }

  /**
   * Create content analysis result
   * @param result Analysis result
   * @returns Created result
   */
  public async createAnalysisResult(result: Omit<ContentAnalysisResult, 'id' | 'createdAt'>): Promise<ContentAnalysisResult> {
    try {
      const now = Date.now();
      const resultId = uuidv4();
      
      const newResult: ContentAnalysisResult = {
        ...result,
        id: resultId,
        createdAt: now
      };

      const query = `
        CREATE (r:ContentAnalysisResult $result)
        RETURN r {.*} as result
      `;

      const createdResult = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { result: newResult });
        return result.records[0].get('result');
      });

      // Create suggestions
      for (const suggestion of newResult.suggestions) {
        await this.createSuggestion(suggestion);
      }

      return createdResult;
    } catch (error) {
      console.error('Error creating content analysis result:', error);
      throw error;
    }
  }

  /**
   * Get content analysis result by ID
   * @param resultId Result ID
   * @returns Content analysis result
   */
  public async getAnalysisResult(resultId: string): Promise<ContentAnalysisResult | null> {
    try {
      const query = `
        MATCH (r:ContentAnalysisResult {id: $resultId})
        RETURN r {.*} as result
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { resultId });
        return result.records.length > 0 ? result.records[0].get('result') : null;
      });

      if (result) {
        // Get suggestions for this result
        const suggestions = await this.getSuggestions({
          sourceId: result.id,
          sourceType: 'ContentAnalysisResult'
        });

        result.suggestions = suggestions;
      }

      return result;
    } catch (error) {
      console.error('Error getting content analysis result:', error);
      throw error;
    }
  }

  /**
   * Get all content analysis results
   * @param contextId Optional context ID
   * @returns Content analysis results
   */
  public async getAnalysisResults(contextId?: string): Promise<ContentAnalysisResult[]> {
    try {
      let whereClause = '';
      const params: Record<string, any> = {};

      if (contextId) {
        whereClause = 'WHERE r.contextId = $contextId';
        params.contextId = contextId;
      }

      const query = `
        MATCH (r:ContentAnalysisResult)
        ${whereClause}
        RETURN r {.*} as result
        ORDER BY r.createdAt DESC
      `;

      const results = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, params);
        return result.records.map(record => record.get('result'));
      });

      // Get suggestions for each result
      for (const result of results) {
        const suggestions = await this.getSuggestions({
          sourceId: result.id,
          sourceType: 'ContentAnalysisResult'
        });

        result.suggestions = suggestions;
      }

      return results;
    } catch (error) {
      console.error('Error getting content analysis results:', error);
      throw error;
    }
  }

  /**
   * Delete content analysis result
   * @param resultId Result ID
   * @returns True if deleted
   */
  public async deleteAnalysisResult(resultId: string): Promise<boolean> {
    try {
      // First delete all suggestions associated with this result
      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(`
          MATCH (s:ContentSuggestion {sourceId: $resultId, sourceType: 'ContentAnalysisResult'})
          DETACH DELETE s
        `, { resultId });
      });

      // Then delete the result itself
      const query = `
        MATCH (r:ContentAnalysisResult {id: $resultId})
        DETACH DELETE r
        RETURN count(r) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { resultId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting content analysis result:', error);
      throw error;
    }
  }
}
