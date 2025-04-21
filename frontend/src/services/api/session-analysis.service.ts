import { AxiosResponse } from 'axios';
import apiClient from './api-client';

export interface SessionAnalysis {
  id: string;
  sessionId: string;
  transcriptionId?: string;
  summary: string;
  keyPoints: string[];
  characters: CharacterInsight[];
  locations: LocationInsight[];
  plotDevelopments: PlotDevelopment[];
  items: ItemInsight[];
  relationships: RelationshipInsight[];
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterInsight {
  id: string;
  name: string;
  description: string;
  actions: string[];
  emotions: string[];
  relationships: string[];
  characterId?: string;
}

export interface LocationInsight {
  id: string;
  name: string;
  description: string;
  events: string[];
  characters: string[];
  locationId?: string;
}

export interface PlotDevelopment {
  id: string;
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  relatedCharacters: string[];
  relatedLocations: string[];
}

export interface ItemInsight {
  id: string;
  name: string;
  description: string;
  significance: string;
  possessedBy?: string;
  itemId?: string;
}

export interface RelationshipInsight {
  id: string;
  source: string;
  target: string;
  type: string;
  description: string;
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AnalysisRequest {
  sessionId: string;
  transcriptionId?: string;
  options?: {
    model?: string;
    includeCharacters?: boolean;
    includeLocations?: boolean;
    includeItems?: boolean;
    includeRelationships?: boolean;
    depth?: 'basic' | 'detailed' | 'comprehensive';
  };
}

export interface AnalysisUpdateRequest {
  summary?: string;
  keyPoints?: string[];
  characters?: CharacterInsight[];
  locations?: LocationInsight[];
  plotDevelopments?: PlotDevelopment[];
  items?: ItemInsight[];
  relationships?: RelationshipInsight[];
  status?: AnalysisStatus;
}

const SessionAnalysisService = {
  /**
   * Get all session analyses
   */
  getSessionAnalyses: async (): Promise<SessionAnalysis[]> => {
    const response: AxiosResponse<{ success: boolean; data: SessionAnalysis[] }> = await apiClient.get('/session-analyses');
    return response.data.data;
  },

  /**
   * Get session analysis by ID
   */
  getSessionAnalysisById: async (id: string): Promise<SessionAnalysis> => {
    const response: AxiosResponse<{ success: boolean; data: SessionAnalysis }> = await apiClient.get(`/session-analyses/${id}`);
    return response.data.data;
  },

  /**
   * Get session analysis by session ID
   */
  getSessionAnalysisBySessionId: async (sessionId: string): Promise<SessionAnalysis> => {
    const response: AxiosResponse<{ success: boolean; data: SessionAnalysis }> = await apiClient.get(`/sessions/${sessionId}/analysis`);
    return response.data.data;
  },

  /**
   * Create a new session analysis
   */
  createSessionAnalysis: async (data: AnalysisRequest): Promise<SessionAnalysis> => {
    const response: AxiosResponse<{ success: boolean; data: SessionAnalysis }> = await apiClient.post('/session-analyses', data);
    return response.data.data;
  },

  /**
   * Update a session analysis
   */
  updateSessionAnalysis: async (id: string, data: AnalysisUpdateRequest): Promise<SessionAnalysis> => {
    const response: AxiosResponse<{ success: boolean; data: SessionAnalysis }> = await apiClient.patch(`/session-analyses/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a session analysis
   */
  deleteSessionAnalysis: async (id: string): Promise<void> => {
    await apiClient.delete(`/session-analyses/${id}`);
  },

  /**
   * Start analysis process for a session
   */
  startAnalysis: async (sessionId: string, options?: AnalysisRequest['options']): Promise<SessionAnalysis> => {
    const response: AxiosResponse<{ success: boolean; data: SessionAnalysis }> = await apiClient.post(`/sessions/${sessionId}/analyze`, { options });
    return response.data.data;
  },

  /**
   * Get analysis status
   */
  getAnalysisStatus: async (id: string): Promise<AnalysisStatus> => {
    const response: AxiosResponse<{ success: boolean; data: { status: AnalysisStatus } }> = await apiClient.get(`/session-analyses/${id}/status`);
    return response.data.data.status;
  },

  /**
   * Export analysis to different formats
   */
  exportAnalysis: async (id: string, format: 'pdf' | 'docx' | 'json'): Promise<Blob> => {
    const response: AxiosResponse<Blob> = await apiClient.get(`/session-analyses/${id}/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate suggestions based on session analysis
   */
  generateSuggestions: async (analysisId: string): Promise<any> => {
    const response: AxiosResponse<{ success: boolean; data: any }> = await apiClient.post(`/session-analyses/${analysisId}/suggestions`);
    return response.data.data;
  },
};

export default SessionAnalysisService;
