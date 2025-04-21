import { AxiosResponse } from 'axios';
import apiClient from './api-client';

export interface Transcription {
  id: string;
  sessionId: string;
  audioFileId: string;
  text: string;
  status: TranscriptionStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    duration?: number;
    wordCount?: number;
    speakerCount?: number;
    speakers?: string[];
    confidence?: number;
  };
}

export enum TranscriptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface TranscriptionRequest {
  sessionId: string;
  audioFileId: string;
  options?: {
    model?: string;
    language?: string;
    speakerDiarization?: boolean;
    maxSpeakers?: number;
  };
}

export interface TranscriptionUpdateRequest {
  text?: string;
  status?: TranscriptionStatus;
  metadata?: Record<string, any>;
}

const TranscriptionService = {
  /**
   * Get all transcriptions
   */
  getTranscriptions: async (): Promise<Transcription[]> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription[] }> = await apiClient.get('/transcriptions');
    return response.data.data;
  },

  /**
   * Get transcription by ID
   */
  getTranscriptionById: async (id: string): Promise<Transcription> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription }> = await apiClient.get(`/transcriptions/${id}`);
    return response.data.data;
  },

  /**
   * Get transcriptions by session ID
   */
  getTranscriptionsBySessionId: async (sessionId: string): Promise<Transcription[]> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription[] }> = await apiClient.get(`/sessions/${sessionId}/transcriptions`);
    return response.data.data;
  },

  /**
   * Get transcriptions by audio file ID
   */
  getTranscriptionsByAudioFileId: async (audioFileId: string): Promise<Transcription[]> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription[] }> = await apiClient.get(`/audio-files/${audioFileId}/transcriptions`);
    return response.data.data;
  },

  /**
   * Create a new transcription
   */
  createTranscription: async (data: TranscriptionRequest): Promise<Transcription> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription }> = await apiClient.post('/transcriptions', data);
    return response.data.data;
  },

  /**
   * Update a transcription
   */
  updateTranscription: async (id: string, data: TranscriptionUpdateRequest): Promise<Transcription> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription }> = await apiClient.patch(`/transcriptions/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a transcription
   */
  deleteTranscription: async (id: string): Promise<void> => {
    await apiClient.delete(`/transcriptions/${id}`);
  },

  /**
   * Start transcription process for an audio file
   */
  startTranscription: async (audioFileId: string, options?: TranscriptionRequest['options']): Promise<Transcription> => {
    const response: AxiosResponse<{ success: boolean; data: Transcription }> = await apiClient.post(`/audio-files/${audioFileId}/transcribe`, { options });
    return response.data.data;
  },

  /**
   * Get transcription status
   */
  getTranscriptionStatus: async (id: string): Promise<TranscriptionStatus> => {
    const response: AxiosResponse<{ success: boolean; data: { status: TranscriptionStatus } }> = await apiClient.get(`/transcriptions/${id}/status`);
    return response.data.data.status;
  },

  /**
   * Export transcription to different formats
   */
  exportTranscription: async (id: string, format: 'txt' | 'srt' | 'vtt' | 'json'): Promise<Blob> => {
    const response: AxiosResponse<Blob> = await apiClient.get(`/transcriptions/${id}/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default TranscriptionService;
