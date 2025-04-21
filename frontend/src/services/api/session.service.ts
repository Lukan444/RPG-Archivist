import apiClient from './client';
import { AxiosResponse } from 'axios';

// Session interface
export interface Session {
  id: string;
  name: string;
  description: string;
  date: string;
  duration: number; // in minutes
  campaignId: string;
  campaignName?: string;
  worldId?: string;
  worldName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  characterCount?: number;
  locationCount?: number;
  hasTranscription?: boolean;
}

// Session creation/update interface
export interface SessionInput {
  name: string;
  description: string;
  date: string;
  duration: number;
  campaignId: string;
  imageUrl?: string;
}

// Session service
const SessionService = {
  /**
   * Get all Sessions
   * @returns List of Sessions
   */
  getAllSessions: async (): Promise<Session[]> => {
    const response: AxiosResponse<{ success: boolean; data: Session[] }> = await apiClient.get('/sessions');
    return response.data.data;
  },

  /**
   * Get Sessions by Campaign ID
   * @param campaignId Campaign ID
   * @returns List of Sessions
   */
  getSessionsByCampaignId: async (campaignId: string): Promise<Session[]> => {
    const response: AxiosResponse<{ success: boolean; data: Session[] }> = await apiClient.get(`/campaigns/${campaignId}/sessions`);
    return response.data.data;
  },

  /**
   * Get Session by ID
   * @param id Session ID
   * @returns Session
   */
  getSessionById: async (id: string): Promise<Session> => {
    const response: AxiosResponse<{ success: boolean; data: Session }> = await apiClient.get(`/sessions/${id}`);
    return response.data.data;
  },

  /**
   * Create new Session
   * @param sessionData Session data
   * @returns Created Session
   */
  createSession: async (sessionData: SessionInput): Promise<Session> => {
    const response: AxiosResponse<{ success: boolean; data: Session }> = await apiClient.post('/sessions', sessionData);
    return response.data.data;
  },

  /**
   * Update Session
   * @param id Session ID
   * @param sessionData Session data
   * @returns Updated Session
   */
  updateSession: async (id: string, sessionData: Partial<SessionInput>): Promise<Session> => {
    const response: AxiosResponse<{ success: boolean; data: Session }> = await apiClient.put(`/sessions/${id}`, sessionData);
    return response.data.data;
  },

  /**
   * Delete Session
   * @param id Session ID
   * @returns Success status
   */
  deleteSession: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(`/sessions/${id}`);
    return response.data.success;
  },

  /**
   * Upload image for Session
   * @param id Session ID
   * @param file Image file
   * @returns Image URL
   */
  uploadSessionImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      `/sessions/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.imageUrl;
  },

  /**
   * Generate image for Session using AI
   * @param id Session ID
   * @param prompt Image generation prompt
   * @returns Image URL
   */
  generateSessionImage: async (id: string, prompt: string): Promise<string> => {
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      `/sessions/${id}/generate-image`,
      { prompt }
    );

    return response.data.data.imageUrl;
  },

  /**
   * Delete Session image
   * @param id Session ID
   * @returns Success status
   */
  deleteSessionImage: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(`/sessions/${id}/image`);
    return response.data.success;
  },

  /**
   * Get Session transcription
   * @param id Session ID
   * @returns Transcription data
   */
  getSessionTranscription: async (id: string): Promise<any> => {
    const response: AxiosResponse<{ success: boolean; data: any }> = await apiClient.get(`/sessions/${id}/transcription`);
    return response.data.data;
  },
};

export default SessionService;
