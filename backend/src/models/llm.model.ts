/**
 * LLM models for Brain feature
 */

/**
 * LLM provider type
 */
export enum LLMProviderType {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
  CUSTOM = 'custom'
}

/**
 * LLM model type
 */
export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProviderType;
  contextWindow: number;
  maxTokens: number;
  isAvailable: boolean;
  capabilities: LLMCapability[];
  metadata?: Record<string, any>;
}

/**
 * LLM capability
 */
export enum LLMCapability {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMBEDDING = 'embedding',
  IMAGE_GENERATION = 'image_generation',
  FUNCTION_CALLING = 'function_calling',
  VISION = 'vision'
}

/**
 * LLM configuration
 */
export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  baseUrl?: string;
  apiEndpoint?: string; // Added for compatibility
  models: LLMModel[];
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  timeout: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

/**
 * LLM message role
 */
export enum LLMMessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  FUNCTION = 'function'
}

/**
 * LLM message
 */
export interface LLMMessage {
  role: LLMMessageRole;
  content: string;
  name?: string;
  functionCall?: LLMFunctionCall;
}

/**
 * LLM function call
 */
export interface LLMFunctionCall {
  name: string;
  arguments: string;
}

/**
 * LLM function definition
 */
export interface LLMFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * LLM request options
 */
export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  functions?: LLMFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
  stream?: boolean;
}

/**
 * LLM response
 */
export interface LLMResponse {
  id: string;
  model: string;
  created: number;
  message: LLMMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
}

/**
 * LLM error
 */
export interface LLMError {
  code: string;
  message: string;
  type: string;
  param?: string;
  details?: Record<string, any>;
}

/**
 * Prompt template
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  systemPrompt?: string;
  requiredCapabilities: LLMCapability[];
  defaultModel?: string;
  defaultOptions?: Partial<LLMRequestOptions>;
  metadata?: Record<string, any>;
  entityType?: string; // Added for compatibility
  createdAt?: string; // Added for compatibility
  updatedAt?: string; // Added for compatibility
}

/**
 * Prompt template variables
 */
export type PromptTemplateVariables = Record<string, string | number | boolean | null | undefined>;

/**
 * LLM context
 */
export interface LLMContext {
  sessionId: string;
  userId: string;
  messages: LLMMessage[];
  metadata?: Record<string, any>;
}

/**
 * LLM cache key
 */
export interface LLMCacheKey {
  messages: LLMMessage[];
  model: string;
  options: Partial<LLMRequestOptions>;
}

/**
 * LLM cache entry
 */
export interface LLMCacheEntry {
  key: LLMCacheKey;
  response: LLMResponse;
  createdAt: number;
  expiresAt: number;
}

/**
 * LLM service interface
 */
export interface LLMService {
  /**
   * Get LLM configuration
   */
  getConfig(): Promise<LLMConfig>;

  /**
   * Update LLM configuration
   * @param config LLM configuration
   */
  updateConfig(config: Partial<LLMConfig>): Promise<LLMConfig>;

  /**
   * Get available models
   */
  getModels(): Promise<LLMModel[]>;

  /**
   * Get model by ID
   * @param modelId Model ID
   */
  getModel(modelId: string): Promise<LLMModel | null>;

  /**
   * Send chat completion request
   * @param messages Messages
   * @param options Request options
   */
  chat(messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;

  /**
   * Send streaming chat completion request
   * @param messages Messages
   * @param callback Callback function for each chunk
   * @param options Request options
   */
  chatStream(
    messages: LLMMessage[],
    callback: (chunk: Partial<LLMResponse>) => void,
    options?: LLMRequestOptions
  ): Promise<void>;

  /**
   * Get prompt template by ID
   * @param templateId Template ID
   */
  getPromptTemplate(templateId: string): Promise<PromptTemplate | null>;

  /**
   * Get all prompt templates
   */
  getPromptTemplates(): Promise<PromptTemplate[]>;

  /**
   * Create prompt template
   * @param template Prompt template
   */
  createPromptTemplate(template: Omit<PromptTemplate, 'id'>): Promise<PromptTemplate>;

  /**
   * Update prompt template
   * @param templateId Template ID
   * @param template Prompt template
   */
  updatePromptTemplate(
    templateId: string,
    template: Partial<Omit<PromptTemplate, 'id'>>
  ): Promise<PromptTemplate>;

  /**
   * Delete prompt template
   * @param templateId Template ID
   */
  deletePromptTemplate(templateId: string): Promise<boolean>;

  /**
   * Render prompt template
   * @param templateId Template ID
   * @param variables Variables
   */
  renderPromptTemplate(templateId: string, variables: PromptTemplateVariables): Promise<string>;

  /**
   * Get LLM context by session ID
   * @param sessionId Session ID
   */
  getContext(sessionId: string): Promise<LLMContext | null>;

  /**
   * Create or update LLM context
   * @param context LLM context
   */
  saveContext(context: LLMContext): Promise<LLMContext>;

  /**
   * Delete LLM context
   * @param sessionId Session ID
   */
  deleteContext(sessionId: string): Promise<boolean>;

  /**
   * Clear cache
   */
  clearCache(): Promise<void>;
}
