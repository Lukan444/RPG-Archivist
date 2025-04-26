import { apiClient } from './api-client';
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
  status?: string;
}

// Session service
const SessionService = {
  /**
   * Get all Sessions
   * @returns List of Sessions
   */
  getAllSessions: async (): Promise<Session[]> => {
    try {
      // In development mode, return mock sessions
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock sessions');
        return [
          {
            id: '1',
            name: 'Session 1: The Pattern of Amber',
            description: 'The party explores the Pattern Chamber in Castle Amber',
            date: new Date().toISOString(),
            duration: 180,
            campaignId: '1',
            campaignName: 'Amber Chronicles',
            imageUrl: 'https://via.placeholder.com/300x200?text=Session+1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            characterCount: 5,
            locationCount: 3,
            hasTranscription: true
          },
          {
            id: '2',
            name: 'Session 2: Journey to the Courts of Chaos',
            description: 'The party travels through shadow to the Courts of Chaos',
            date: new Date().toISOString(),
            duration: 240,
            campaignId: '1',
            campaignName: 'Amber Chronicles',
            imageUrl: 'https://via.placeholder.com/300x200?text=Session+2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            characterCount: 6,
            locationCount: 4,
            hasTranscription: true
          }
        ];
      }

      const response: AxiosResponse<{ success: boolean; data: Session[] }> = await apiClient.get('/sessions');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // In development mode, return mock sessions
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock sessions after error');
        return [
          {
            id: '1',
            name: 'Session 1: The Pattern of Amber',
            description: 'The party explores the Pattern Chamber in Castle Amber',
            date: new Date().toISOString(),
            duration: 180,
            campaignId: '1',
            campaignName: 'Amber Chronicles',
            imageUrl: 'https://via.placeholder.com/300x200?text=Session+1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            characterCount: 5,
            locationCount: 3,
            hasTranscription: true
          },
          {
            id: '2',
            name: 'Session 2: Journey to the Courts of Chaos',
            description: 'The party travels through shadow to the Courts of Chaos',
            date: new Date().toISOString(),
            duration: 240,
            campaignId: '1',
            campaignName: 'Amber Chronicles',
            imageUrl: 'https://via.placeholder.com/300x200?text=Session+2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            characterCount: 6,
            locationCount: 4,
            hasTranscription: true
          }
        ];
      }
      throw error;
    }
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
  getSession: async (id: string): Promise<Session> => {
    try {
      // In development mode, return a mock session
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock session');
        return {
          id,
          name: id === '1' ? 'Session 1: The Pattern of Amber' : 'Session 2: Journey to the Courts of Chaos',
          description: id === '1' ? 'The party explores the Pattern Chamber in Castle Amber' : 'The party travels through shadow to the Courts of Chaos',
          date: new Date().toISOString(),
          duration: id === '1' ? 180 : 240,
          campaignId: '1',
          campaignName: 'Amber Chronicles',
          imageUrl: `https://via.placeholder.com/300x200?text=Session+${id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          characterCount: id === '1' ? 5 : 6,
          locationCount: id === '1' ? 3 : 4,
          hasTranscription: true
        };
      }

      const response: AxiosResponse<{ success: boolean; data: Session }> = await apiClient.get(`/sessions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching session ${id}:`, error);
      // In development mode, return a mock session
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock session after error');
        return {
          id,
          name: id === '1' ? 'Session 1: The Pattern of Amber' : 'Session 2: Journey to the Courts of Chaos',
          description: id === '1' ? 'The party explores the Pattern Chamber in Castle Amber' : 'The party travels through shadow to the Courts of Chaos',
          date: new Date().toISOString(),
          duration: id === '1' ? 180 : 240,
          campaignId: '1',
          campaignName: 'Amber Chronicles',
          imageUrl: `https://via.placeholder.com/300x200?text=Session+${id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          characterCount: id === '1' ? 5 : 6,
          locationCount: id === '1' ? 3 : 4,
          hasTranscription: true
        };
      }
      throw error;
    }
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
