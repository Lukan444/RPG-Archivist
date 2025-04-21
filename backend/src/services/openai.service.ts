import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  LLMMessage,
  LLMResponse,
  LLMRequestOptions,
  LLMFunction,
  LLMError
} from '../models/llm.model';

/**
 * OpenAI API service
 */
export class OpenAIService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', defaultModel: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const openaiError: LLMError = {
            code: error.response.data.error?.code || 'unknown_error',
            message: error.response.data.error?.message || 'Unknown error occurred',
            type: error.response.data.error?.type || 'api_error',
            param: error.response.data.error?.param,
            details: error.response.data.error?.details
          };
          
          throw openaiError;
        }
        
        throw error;
      }
    );
  }

  /**
   * Get available models
   * @returns List of available models
   */
  public async getModels(): Promise<any[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data;
    } catch (error) {
      console.error('Error getting OpenAI models:', error);
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
      const model = options.model || this.defaultModel;
      
      const requestBody: any = {
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.name ? { name: msg.name } : {}),
          ...(msg.functionCall ? { function_call: {
            name: msg.functionCall.name,
            arguments: msg.functionCall.arguments
          }} : {})
        })),
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options.maxTokens !== undefined ? options.maxTokens : 1000,
        top_p: options.topP !== undefined ? options.topP : 1,
        frequency_penalty: options.frequencyPenalty !== undefined ? options.frequencyPenalty : 0,
        presence_penalty: options.presencePenalty !== undefined ? options.presencePenalty : 0
      };

      // Add functions if provided
      if (options.functions && options.functions.length > 0) {
        requestBody.functions = options.functions;
        
        if (options.functionCall) {
          requestBody.function_call = options.functionCall;
        }
      }

      const response = await this.client.post('/chat/completions', requestBody);
      
      const responseData = response.data;
      const choice = responseData.choices[0];
      
      // Convert to standardized LLM response
      const llmResponse: LLMResponse = {
        id: responseData.id,
        model: responseData.model,
        created: responseData.created,
        message: {
          role: choice.message.role,
          content: choice.message.content || '',
          ...(choice.message.name ? { name: choice.message.name } : {}),
          ...(choice.message.function_call ? {
            functionCall: {
              name: choice.message.function_call.name,
              arguments: choice.message.function_call.arguments
            }
          } : {})
        },
        usage: {
          promptTokens: responseData.usage.prompt_tokens,
          completionTokens: responseData.usage.completion_tokens,
          totalTokens: responseData.usage.total_tokens
        },
        finishReason: choice.finish_reason
      };

      return llmResponse;
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
      const model = options.model || this.defaultModel;
      
      const requestBody: any = {
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.name ? { name: msg.name } : {}),
          ...(msg.functionCall ? { function_call: {
            name: msg.functionCall.name,
            arguments: msg.functionCall.arguments
          }} : {})
        })),
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options.maxTokens !== undefined ? options.maxTokens : 1000,
        top_p: options.topP !== undefined ? options.topP : 1,
        frequency_penalty: options.frequencyPenalty !== undefined ? options.frequencyPenalty : 0,
        presence_penalty: options.presencePenalty !== undefined ? options.presencePenalty : 0,
        stream: true
      };

      // Add functions if provided
      if (options.functions && options.functions.length > 0) {
        requestBody.functions = options.functions;
        
        if (options.functionCall) {
          requestBody.function_call = options.functionCall;
        }
      }

      const response = await this.client.post('/chat/completions', requestBody, {
        responseType: 'stream'
      });

      const stream = response.data;
      
      stream.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.choices && data.choices.length > 0) {
                const choice = data.choices[0];
                const delta = choice.delta;
                
                // Convert to standardized LLM response chunk
                const responseChunk: Partial<LLMResponse> = {
                  id: data.id,
                  model: data.model,
                  created: data.created,
                  message: {
                    role: delta.role || 'assistant',
                    content: delta.content || '',
                    ...(delta.function_call ? {
                      functionCall: {
                        name: delta.function_call.name,
                        arguments: delta.function_call.arguments
                      }
                    } : {})
                  },
                  finishReason: choice.finish_reason
                };
                
                callback(responseChunk);
              }
            } catch (error) {
              console.error('Error parsing streaming response:', error);
            }
          }
        }
      });

      stream.on('end', () => {
        // Stream ended
      });

      stream.on('error', (error: any) => {
        console.error('Error in streaming response:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error sending streaming chat completion request:', error);
      throw error;
    }
  }
}
