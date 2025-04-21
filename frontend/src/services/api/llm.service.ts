import { apiClient } from './api-client';
import { AxiosResponse } from 'axios';

// LLM provider type
export enum LLMProviderType {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
  CUSTOM = 'custom'
}

// LLM capability
export enum LLMCapability {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMBEDDING = 'embedding',
  IMAGE_GENERATION = 'image_generation',
  FUNCTION_CALLING = 'function_calling',
  VISION = 'vision'
}

// LLM model
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

// LLM configuration
export interface LLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  baseUrl?: string;
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

// LLM message role
export enum LLMMessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  FUNCTION = 'function'
}

// LLM message
export interface LLMMessage {
  role: LLMMessageRole;
  content: string;
  name?: string;
  functionCall?: LLMFunctionCall;
}

// LLM function call
export interface LLMFunctionCall {
  name: string;
  arguments: string;
}

// LLM function definition
export interface LLMFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// LLM request options
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

// LLM response
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

// Prompt template
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
}

// Prompt template variables
export type PromptTemplateVariables = Record<string, string | number | boolean | null | undefined>;

// LLM context
export interface LLMContext {
  sessionId: string;
  userId: string;
  messages: LLMMessage[];
  metadata?: Record<string, any>;
}

/**
 * LLM service for interacting with the LLM API
 */
export const LLMService = {
  /**
   * Get LLM configuration
   * @returns LLM configuration
   */
  getConfig: async (): Promise<LLMConfig> => {
    const response: AxiosResponse<{ success: boolean; data: LLMConfig }> = await apiClient.get('/llm/config');
    return response.data.data;
  },

  /**
   * Update LLM configuration
   * @param config LLM configuration
   * @returns Updated LLM configuration
   */
  updateConfig: async (config: Partial<LLMConfig>): Promise<LLMConfig> => {
    const response: AxiosResponse<{ success: boolean; data: LLMConfig }> = await apiClient.put('/llm/config', config);
    return response.data.data;
  },

  /**
   * Get available models
   * @returns Available models
   */
  getModels: async (): Promise<LLMModel[]> => {
    const response: AxiosResponse<{ success: boolean; data: LLMModel[] }> = await apiClient.get('/llm/models');
    return response.data.data;
  },

  /**
   * Get model by ID
   * @param modelId Model ID
   * @returns Model
   */
  getModel: async (modelId: string): Promise<LLMModel> => {
    const response: AxiosResponse<{ success: boolean; data: LLMModel }> = await apiClient.get(`/llm/models/${modelId}`);
    return response.data.data;
  },

  /**
   * Send chat completion request
   * @param messages Messages
   * @param options Request options
   * @returns LLM response
   */
  chat: async (messages: LLMMessage[], options: LLMRequestOptions = {}): Promise<LLMResponse> => {
    const response: AxiosResponse<{ success: boolean; data: LLMResponse }> = await apiClient.post('/llm/chat', {
      messages,
      options
    });
    return response.data.data;
  },

  /**
   * Send streaming chat completion request
   * @param messages Messages
   * @param callback Callback function for each chunk
   * @param options Request options
   */
  chatStream: async (
    messages: LLMMessage[],
    callback: (chunk: Partial<LLMResponse>) => void,
    options: LLMRequestOptions = {}
  ): Promise<void> => {
    const response = await apiClient.post('/llm/chat/stream', {
      messages,
      options: { ...options, stream: true }
    }, {
      responseType: 'stream'
    });

    const reader = response.data.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.substring(6));
            callback(data);
          } catch (error) {
            console.error('Error parsing streaming response:', error);
          }
        }
      }
    }
  },

  /**
   * Get all prompt templates
   * @returns Prompt templates
   */
  getPromptTemplates: async (): Promise<PromptTemplate[]> => {
    const response: AxiosResponse<{ success: boolean; data: PromptTemplate[] }> = await apiClient.get('/llm/templates');
    return response.data.data;
  },

  /**
   * Get prompt template by ID
   * @param templateId Template ID
   * @returns Prompt template
   */
  getPromptTemplate: async (templateId: string): Promise<PromptTemplate> => {
    const response: AxiosResponse<{ success: boolean; data: PromptTemplate }> = await apiClient.get(`/llm/templates/${templateId}`);
    return response.data.data;
  },

  /**
   * Create prompt template
   * @param template Prompt template
   * @returns Created prompt template
   */
  createPromptTemplate: async (template: Omit<PromptTemplate, 'id'>): Promise<PromptTemplate> => {
    const response: AxiosResponse<{ success: boolean; data: PromptTemplate }> = await apiClient.post('/llm/templates', template);
    return response.data.data;
  },

  /**
   * Update prompt template
   * @param templateId Template ID
   * @param template Prompt template
   * @returns Updated prompt template
   */
  updatePromptTemplate: async (templateId: string, template: Partial<Omit<PromptTemplate, 'id'>>): Promise<PromptTemplate> => {
    const response: AxiosResponse<{ success: boolean; data: PromptTemplate }> = await apiClient.put(`/llm/templates/${templateId}`, template);
    return response.data.data;
  },

  /**
   * Delete prompt template
   * @param templateId Template ID
   * @returns Success message
   */
  deletePromptTemplate: async (templateId: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.delete(`/llm/templates/${templateId}`);
    return response.data.data;
  },

  /**
   * Render prompt template
   * @param templateId Template ID
   * @param variables Variables
   * @returns Rendered prompt
   */
  renderPromptTemplate: async (templateId: string, variables: PromptTemplateVariables): Promise<string> => {
    const response: AxiosResponse<{ success: boolean; data: { prompt: string } }> = await apiClient.post(`/llm/templates/${templateId}/render`, variables);
    return response.data.data.prompt;
  },

  /**
   * Get LLM context by session ID
   * @param sessionId Session ID
   * @returns LLM context
   */
  getContext: async (sessionId: string): Promise<LLMContext> => {
    const response: AxiosResponse<{ success: boolean; data: LLMContext }> = await apiClient.get(`/llm/context/${sessionId}`);
    return response.data.data;
  },

  /**
   * Create or update LLM context
   * @param sessionId Session ID
   * @param context LLM context
   * @returns Updated LLM context
   */
  saveContext: async (sessionId: string, context: Omit<LLMContext, 'sessionId' | 'userId'>): Promise<LLMContext> => {
    const response: AxiosResponse<{ success: boolean; data: LLMContext }> = await apiClient.post(`/llm/context/${sessionId}`, context);
    return response.data.data;
  },

  /**
   * Delete LLM context
   * @param sessionId Session ID
   * @returns Success message
   */
  deleteContext: async (sessionId: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.delete(`/llm/context/${sessionId}`);
    return response.data.data;
  },

  /**
   * Clear cache
   * @returns Success message
   */
  clearCache: async (): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.post('/llm/cache/clear');
    return response.data.data;
  }
};
