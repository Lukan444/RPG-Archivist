import { DatabaseService } from '../services/database.service';
import {
  LLMConfig,
  LLMContext,
  PromptTemplate,
  LLMCacheEntry,
  LLMCacheKey
} from '../models/llm.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for LLM-related data
 */
export class LLMRepository {
  private dbService: DatabaseService;
  private cache: Map<string, LLMCacheEntry> = new Map();

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Get LLM configuration
   * @returns LLM configuration
   */
  public async getConfig(): Promise<LLMConfig | null> {
    try {
      const query = `
        MATCH (c:LLMConfig)
        RETURN c {.*} as config
        LIMIT 1
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query);
        return result.records.length > 0 ? result.records[0].get('config') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting LLM configuration:', error);
      throw error;
    }
  }

  /**
   * Create or update LLM configuration
   * @param config LLM configuration
   * @returns Updated LLM configuration
   */
  public async saveConfig(config: LLMConfig): Promise<LLMConfig> {
    try {
      const query = `
        MERGE (c:LLMConfig)
        SET c += $config
        RETURN c {.*} as config
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { config });
        return result.records[0].get('config');
      });

      return result;
    } catch (error) {
      console.error('Error saving LLM configuration:', error);
      throw error;
    }
  }

  /**
   * Get prompt template by ID
   * @param templateId Template ID
   * @returns Prompt template
   */
  public async getPromptTemplate(templateId: string): Promise<PromptTemplate | null> {
    try {
      const query = `
        MATCH (t:PromptTemplate {id: $templateId})
        RETURN t {.*} as template
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { templateId });
        return result.records.length > 0 ? result.records[0].get('template') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting prompt template:', error);
      throw error;
    }
  }

  /**
   * Get all prompt templates
   * @returns Prompt templates
   */
  public async getPromptTemplates(): Promise<PromptTemplate[]> {
    try {
      const query = `
        MATCH (t:PromptTemplate)
        RETURN t {.*} as template
        ORDER BY t.name
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query);
        return result.records.map((record) => record.get('template'));
      });

      return result;
    } catch (error) {
      console.error('Error getting prompt templates:', error);
      throw error;
    }
  }

  /**
   * Create prompt template
   * @param template Prompt template
   * @returns Created prompt template
   */
  public async createPromptTemplate(template: Omit<PromptTemplate, 'id'>): Promise<PromptTemplate> {
    try {
      const templateId = uuidv4();
      const newTemplate: PromptTemplate = {
        ...template,
        id: templateId
      };

      const query = `
        CREATE (t:PromptTemplate $template)
        RETURN t {.*} as template
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { template: newTemplate });
        return result.records[0].get('template');
      });

      return result;
    } catch (error) {
      console.error('Error creating prompt template:', error);
      throw error;
    }
  }

  /**
   * Update prompt template
   * @param templateId Template ID
   * @param template Prompt template
   * @returns Updated prompt template
   */
  public async updatePromptTemplate(
    templateId: string,
    template: Partial<Omit<PromptTemplate, 'id'>>
  ): Promise<PromptTemplate> {
    try {
      const query = `
        MATCH (t:PromptTemplate {id: $templateId})
        SET t += $template
        RETURN t {.*} as template
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { templateId, template });
        return result.records.length > 0 ? result.records[0].get('template') : null;
      });

      if (!result) {
        throw new Error(`Prompt template with ID ${templateId} not found`);
      }

      return result;
    } catch (error) {
      console.error('Error updating prompt template:', error);
      throw error;
    }
  }

  /**
   * Delete prompt template
   * @param templateId Template ID
   * @returns True if deleted
   */
  public async deletePromptTemplate(templateId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (t:PromptTemplate {id: $templateId})
        DELETE t
        RETURN count(t) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { templateId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting prompt template:', error);
      throw error;
    }
  }

  /**
   * Get LLM context by session ID
   * @param sessionId Session ID
   * @returns LLM context
   */
  public async getContext(sessionId: string): Promise<LLMContext | null> {
    try {
      const query = `
        MATCH (c:LLMContext {sessionId: $sessionId})
        RETURN c {.*} as context
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records.length > 0 ? result.records[0].get('context') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting LLM context:', error);
      throw error;
    }
  }

  /**
   * Create or update LLM context
   * @param context LLM context
   * @returns Updated LLM context
   */
  public async saveContext(context: LLMContext): Promise<LLMContext> {
    try {
      const query = `
        MERGE (c:LLMContext {sessionId: $context.sessionId})
        SET c = $context
        RETURN c {.*} as context
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { context });
        return result.records[0].get('context');
      });

      return result;
    } catch (error) {
      console.error('Error saving LLM context:', error);
      throw error;
    }
  }

  /**
   * Delete LLM context
   * @param sessionId Session ID
   * @returns True if deleted
   */
  public async deleteContext(sessionId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (c:LLMContext {sessionId: $sessionId})
        DELETE c
        RETURN count(c) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { sessionId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting LLM context:', error);
      throw error;
    }
  }

  /**
   * Add entry to cache
   * @param key Cache key
   * @param response LLM response
   * @param ttl Time to live in milliseconds
   */
  public addToCache(key: LLMCacheKey, response: any, ttl: number): void {
    const cacheKey = JSON.stringify(key);
    const now = Date.now();
    const entry: LLMCacheEntry = {
      key,
      response,
      createdAt: now,
      expiresAt: now + ttl
    };
    this.cache.set(cacheKey, entry);
  }

  /**
   * Get entry from cache
   * @param key Cache key
   * @returns Cache entry or null if not found or expired
   */
  public getFromCache(key: LLMCacheKey): any | null {
    const cacheKey = JSON.stringify(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.response;
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}
