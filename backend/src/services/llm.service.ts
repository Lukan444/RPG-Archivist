import { LLMRepository } from '../repositories/llm.repository';
import { OpenAIService } from './openai.service';
import { OllamaService } from './ollama.service';
import {
  LLMConfig,
  LLMModel,
  LLMProviderType,
  LLMCapability,
  LLMMessage,
  LLMResponse,
  LLMRequestOptions,
  LLMContext,
  PromptTemplate,
  PromptTemplateVariables,
  LLMCacheKey,
  LLMService as LLMServiceInterface
} from '../models/llm.model';

/**
 * LLM service
 */
export class LLMService implements LLMServiceInterface {
  private llmRepository: LLMRepository;
  private openaiService: OpenAIService | null = null;
  private ollamaService: OllamaService | null = null;
  private config: LLMConfig | null = null;

  constructor(llmRepository: LLMRepository) {
    this.llmRepository = llmRepository;
  }

  /**
   * Initialize LLM service
   */
  public async initialize(): Promise<void> {
    try {
      // Get configuration
      let config = await this.llmRepository.getConfig();
      
      // Create default configuration if not exists
      if (!config) {
        config = await this.createDefaultConfig();
      }
      
      this.config = config;
      
      // Initialize services based on configuration
      this.initializeServices();
    } catch (error) {
      console.error('Error initializing LLM service:', error);
      throw error;
    }
  }

  /**
   * Create default configuration
   * @returns Default configuration
   */
  private async createDefaultConfig(): Promise<LLMConfig> {
    const defaultConfig: LLMConfig = {
      provider: LLMProviderType.OPENAI,
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: LLMProviderType.OPENAI,
          contextWindow: 128000,
          maxTokens: 4096,
          isAvailable: true,
          capabilities: [
            LLMCapability.CHAT,
            LLMCapability.COMPLETION,
            LLMCapability.FUNCTION_CALLING,
            LLMCapability.VISION
          ]
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: LLMProviderType.OPENAI,
          contextWindow: 16385,
          maxTokens: 4096,
          isAvailable: true,
          capabilities: [
            LLMCapability.CHAT,
            LLMCapability.COMPLETION,
            LLMCapability.FUNCTION_CALLING
          ]
        }
      ],
      defaultModel: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      timeout: 60000,
      cacheEnabled: true,
      cacheTTL: 3600000 // 1 hour
    };
    
    return await this.llmRepository.saveConfig(defaultConfig);
  }

  /**
   * Initialize services based on configuration
   */
  private initializeServices(): void {
    if (!this.config) {
      throw new Error('LLM configuration not initialized');
    }
    
    // Initialize OpenAI service if configured
    if (this.config.provider === LLMProviderType.OPENAI || this.config.apiKey) {
      this.openaiService = new OpenAIService(
        this.config.apiKey || '',
        this.config.baseUrl || 'https://api.openai.com/v1',
        this.config.defaultModel
      );
    }
    
    // Initialize Ollama service if configured
    if (this.config.provider === LLMProviderType.OLLAMA) {
      this.ollamaService = new OllamaService(
        this.config.baseUrl || 'http://localhost:11434',
        this.config.defaultModel
      );
    }
  }

  /**
   * Get LLM configuration
   * @returns LLM configuration
   */
  public async getConfig(): Promise<LLMConfig> {
    if (!this.config) {
      await this.initialize();
    }
    
    if (!this.config) {
      throw new Error('Failed to initialize LLM configuration');
    }
    
    return this.config;
  }

  /**
   * Update LLM configuration
   * @param config LLM configuration
   * @returns Updated LLM configuration
   */
  public async updateConfig(config: Partial<LLMConfig>): Promise<LLMConfig> {
    try {
      // Get current configuration
      const currentConfig = await this.getConfig();
      
      // Update configuration
      const updatedConfig = await this.llmRepository.saveConfig({
        ...currentConfig,
        ...config
      });
      
      // Update local configuration
      this.config = updatedConfig;
      
      // Reinitialize services
      this.initializeServices();
      
      return updatedConfig;
    } catch (error) {
      console.error('Error updating LLM configuration:', error);
      throw error;
    }
  }

  /**
   * Get available models
   * @returns Available models
   */
  public async getModels(): Promise<LLMModel[]> {
    try {
      const config = await this.getConfig();
      return config.models;
    } catch (error) {
      console.error('Error getting LLM models:', error);
      throw error;
    }
  }

  /**
   * Get model by ID
   * @param modelId Model ID
   * @returns Model or null if not found
   */
  public async getModel(modelId: string): Promise<LLMModel | null> {
    try {
      const models = await this.getModels();
      return models.find(model => model.id === modelId) || null;
    } catch (error) {
      console.error('Error getting LLM model:', error);
      throw error;
    }
  }

  /**
   * Send chat completion request
   * @param messages Messages
   * @param options Request options
   * @returns LLM response
   */
  public async chat(messages: LLMMessage[], options: LLMRequestOptions = {}): Promise<LLMResponse> {
    try {
      const config = await this.getConfig();
      
      // Check if caching is enabled
      if (config.cacheEnabled) {
        const cacheKey: LLMCacheKey = {
          messages,
          model: options.model || config.defaultModel,
          options
        };
        
        // Check cache
        const cachedResponse = this.llmRepository.getFromCache(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }
      
      // Get provider
      const provider = options.model ? 
        (await this.getModel(options.model))?.provider : 
        config.provider;
      
      // Set default options
      const requestOptions: LLMRequestOptions = {
        model: options.model || config.defaultModel,
        temperature: options.temperature !== undefined ? options.temperature : config.temperature,
        maxTokens: options.maxTokens !== undefined ? options.maxTokens : config.maxTokens,
        topP: options.topP !== undefined ? options.topP : config.topP,
        frequencyPenalty: options.frequencyPenalty !== undefined ? options.frequencyPenalty : config.frequencyPenalty,
        presencePenalty: options.presencePenalty !== undefined ? options.presencePenalty : config.presencePenalty,
        functions: options.functions,
        functionCall: options.functionCall,
        stream: options.stream
      };
      
      // Send request based on provider
      let response: LLMResponse;
      
      switch (provider) {
        case LLMProviderType.OPENAI:
          if (!this.openaiService) {
            throw new Error('OpenAI service not initialized');
          }
          response = await this.openaiService.chat(messages, requestOptions);
          break;
          
        case LLMProviderType.OLLAMA:
          if (!this.ollamaService) {
            throw new Error('Ollama service not initialized');
          }
          response = await this.ollamaService.chat(messages, requestOptions);
          break;
          
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
      
      // Cache response if caching is enabled
      if (config.cacheEnabled) {
        const cacheKey: LLMCacheKey = {
          messages,
          model: options.model || config.defaultModel,
          options
        };
        
        this.llmRepository.addToCache(cacheKey, response, config.cacheTTL);
      }
      
      return response;
    } catch (error) {
      console.error('Error sending chat completion request:', error);
      throw error;
    }
  }

  /**
   * Send streaming chat completion request
   * @param messages Messages
   * @param callback Callback function for each chunk
   * @param options Request options
   */
  public async chatStream(
    messages: LLMMessage[],
    callback: (chunk: Partial<LLMResponse>) => void,
    options: LLMRequestOptions = {}
  ): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Get provider
      const provider = options.model ? 
        (await this.getModel(options.model))?.provider : 
        config.provider;
      
      // Set default options
      const requestOptions: LLMRequestOptions = {
        model: options.model || config.defaultModel,
        temperature: options.temperature !== undefined ? options.temperature : config.temperature,
        maxTokens: options.maxTokens !== undefined ? options.maxTokens : config.maxTokens,
        topP: options.topP !== undefined ? options.topP : config.topP,
        frequencyPenalty: options.frequencyPenalty !== undefined ? options.frequencyPenalty : config.frequencyPenalty,
        presencePenalty: options.presencePenalty !== undefined ? options.presencePenalty : config.presencePenalty,
        functions: options.functions,
        functionCall: options.functionCall,
        stream: true
      };
      
      // Send request based on provider
      switch (provider) {
        case LLMProviderType.OPENAI:
          if (!this.openaiService) {
            throw new Error('OpenAI service not initialized');
          }
          await this.openaiService.chatStream(messages, callback, requestOptions);
          break;
          
        case LLMProviderType.OLLAMA:
          if (!this.ollamaService) {
            throw new Error('Ollama service not initialized');
          }
          await this.ollamaService.chatStream(messages, callback, requestOptions);
          break;
          
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      console.error('Error sending streaming chat completion request:', error);
      throw error;
    }
  }

  /**
   * Get prompt template by ID
   * @param templateId Template ID
   * @returns Prompt template or null if not found
   */
  public async getPromptTemplate(templateId: string): Promise<PromptTemplate | null> {
    try {
      return await this.llmRepository.getPromptTemplate(templateId);
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
      return await this.llmRepository.getPromptTemplates();
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
      return await this.llmRepository.createPromptTemplate(template);
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
      return await this.llmRepository.updatePromptTemplate(templateId, template);
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
      return await this.llmRepository.deletePromptTemplate(templateId);
    } catch (error) {
      console.error('Error deleting prompt template:', error);
      throw error;
    }
  }

  /**
   * Render prompt template
   * @param templateId Template ID
   * @param variables Variables
   * @returns Rendered prompt
   */
  public async renderPromptTemplate(templateId: string, variables: PromptTemplateVariables): Promise<string> {
    try {
      const template = await this.getPromptTemplate(templateId);
      
      if (!template) {
        throw new Error(`Prompt template with ID ${templateId} not found`);
      }
      
      // Replace variables in template
      let renderedPrompt = template.template;
      
      for (const [key, value] of Object.entries(variables)) {
        if (value !== undefined && value !== null) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          renderedPrompt = renderedPrompt.replace(regex, String(value));
        }
      }
      
      return renderedPrompt;
    } catch (error) {
      console.error('Error rendering prompt template:', error);
      throw error;
    }
  }

  /**
   * Get LLM context by session ID
   * @param sessionId Session ID
   * @returns LLM context or null if not found
   */
  public async getContext(sessionId: string): Promise<LLMContext | null> {
    try {
      return await this.llmRepository.getContext(sessionId);
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
      return await this.llmRepository.saveContext(context);
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
      return await this.llmRepository.deleteContext(sessionId);
    } catch (error) {
      console.error('Error deleting LLM context:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  public async clearCache(): Promise<void> {
    try {
      this.llmRepository.clearCache();
    } catch (error) {
      console.error('Error clearing LLM cache:', error);
      throw error;
    }
  }
}
