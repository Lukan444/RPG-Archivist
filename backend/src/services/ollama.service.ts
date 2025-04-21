import axios, { AxiosInstance } from 'axios';
import {
  LLMMessage,
  LLMResponse,
  LLMRequestOptions,
  LLMMessageRole,
  LLMError
} from '../models/llm.model';

/**
 * Ollama API service
 */
export class OllamaService {
  private client: AxiosInstance;
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'llama3') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const ollamaError: LLMError = {
            code: 'ollama_error',
            message: error.response.data.error || 'Unknown error occurred',
            type: 'api_error',
            details: error.response.data
          };
          
          throw ollamaError;
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
      const response = await this.client.get('/api/tags');
      return response.data.models;
    } catch (error) {
      console.error('Error getting Ollama models:', error);
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
      
      // Convert messages to Ollama format
      const formattedMessages = this.formatMessages(messages);
      
      const requestBody: any = {
        model,
        messages: formattedMessages,
        options: {
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          num_predict: options.maxTokens !== undefined ? options.maxTokens : 1000,
          top_p: options.topP !== undefined ? options.topP : 1,
          frequency_penalty: options.frequencyPenalty !== undefined ? options.frequencyPenalty : 0,
          presence_penalty: options.presencePenalty !== undefined ? options.presencePenalty : 0
        }
      };

      const response = await this.client.post('/api/chat', requestBody);
      
      const responseData = response.data;
      
      // Convert to standardized LLM response
      const llmResponse: LLMResponse = {
        id: `ollama-${Date.now()}`,
        model: responseData.model,
        created: Math.floor(Date.now() / 1000),
        message: {
          role: LLMMessageRole.ASSISTANT,
          content: responseData.message.content
        },
        usage: {
          promptTokens: responseData.prompt_eval_count || 0,
          completionTokens: responseData.eval_count || 0,
          totalTokens: (responseData.prompt_eval_count || 0) + (responseData.eval_count || 0)
        },
        finishReason: 'stop'
      };

      return llmResponse;
    } catch (error) {
      console.error('Error sending chat completion request to Ollama:', error);
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
      
      // Convert messages to Ollama format
      const formattedMessages = this.formatMessages(messages);
      
      const requestBody: any = {
        model,
        messages: formattedMessages,
        options: {
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          num_predict: options.maxTokens !== undefined ? options.maxTokens : 1000,
          top_p: options.topP !== undefined ? options.topP : 1,
          frequency_penalty: options.frequencyPenalty !== undefined ? options.frequencyPenalty : 0,
          presence_penalty: options.presencePenalty !== undefined ? options.presencePenalty : 0
        },
        stream: true
      };

      const response = await this.client.post('/api/chat', requestBody, {
        responseType: 'stream'
      });

      const stream = response.data;
      let content = '';
      
      stream.on('data', (chunk: Buffer) => {
        try {
          const data = JSON.parse(chunk.toString());
          
          if (data.message) {
            content += data.message.content || '';
            
            // Convert to standardized LLM response chunk
            const responseChunk: Partial<LLMResponse> = {
              id: `ollama-${Date.now()}`,
              model: data.model,
              created: Math.floor(Date.now() / 1000),
              message: {
                role: LLMMessageRole.ASSISTANT,
                content: data.message.content || ''
              },
              finishReason: data.done ? 'stop' : null
            };
            
            callback(responseChunk);
          }
        } catch (error) {
          console.error('Error parsing streaming response from Ollama:', error);
        }
      });

      stream.on('end', () => {
        // Stream ended
        callback({
          message: {
            role: LLMMessageRole.ASSISTANT,
            content
          },
          finishReason: 'stop'
        });
      });

      stream.on('error', (error: any) => {
        console.error('Error in streaming response from Ollama:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error sending streaming chat completion request to Ollama:', error);
      throw error;
    }
  }

  /**
   * Format messages for Ollama API
   * @param messages Messages
   * @returns Formatted messages
   */
  private formatMessages(messages: LLMMessage[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}
