import { apiClient } from './api-client';
import { AxiosResponse } from 'axios';

// Content suggestion type
export enum SuggestionType {
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  EVENT = 'event',
  RELATIONSHIP = 'relationship',
  LORE = 'lore',
  DIALOG = 'dialog',
  PLOT = 'plot',
  NOTE = 'note'
}

// Content suggestion status
export enum SuggestionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  MODIFIED = 'modified'
}

// Content suggestion confidence level
export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Base content suggestion interface
export interface ContentSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  status: SuggestionStatus;
  sourceId?: string;
  sourceType?: string;
  contextId?: string;
  contextType?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
  sourceDetails?: {
    id: string;
    name: string;
    type: string;
  };
  contextDetails?: {
    id: string;
    name: string;
    type: string;
  };
}

// Character suggestion
export interface CharacterSuggestion extends ContentSuggestion {
  type: SuggestionType.CHARACTER;
  characterData: {
    name: string;
    description?: string;
    background?: string;
    personality?: string;
    appearance?: string;
    goals?: string;
    relationships?: RelationshipSuggestion[];
  };
}

// Location suggestion
export interface LocationSuggestion extends ContentSuggestion {
  type: SuggestionType.LOCATION;
  locationData: {
    name: string;
    description?: string;
    history?: string;
    features?: string;
    inhabitants?: string;
    pointsOfInterest?: string[];
    parentLocationId?: string;
  };
}

// Relationship suggestion
export interface RelationshipSuggestion extends ContentSuggestion {
  type: SuggestionType.RELATIONSHIP;
  relationshipData: {
    sourceId?: string;
    sourceType?: string;
    sourceName: string;
    targetId?: string;
    targetType?: string;
    targetName: string;
    relationshipType: string;
    description?: string;
    strength?: number; // 1-10 scale
  };
  // Added properties to fix UI issues
  source?: {
    id?: string;
    name?: string;
    type?: string;
  };
  target?: {
    id?: string;
    name?: string;
    type?: string;
  };
}

// Lore suggestion
export interface LoreSuggestion extends ContentSuggestion {
  type: SuggestionType.LORE;
  loreData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    relatedEntities?: {
      id?: string;
      type?: string;
      name: string;
    }[];
  };
}

// Dialog suggestion
export interface DialogSuggestion extends ContentSuggestion {
  type: SuggestionType.DIALOG;
  dialogData: {
    characterId?: string;
    characterName: string;
    content: string;
    context?: string;
    tone?: string;
    purpose?: string;
    alternatives?: string[];
  };
}

// Event suggestion
export interface EventSuggestion extends ContentSuggestion {
  type: SuggestionType.EVENT;
  eventData: {
    name: string;
    description?: string;
    date?: string;
    location?: string;
    participants?: {
      id?: string;
      type?: string;
      name: string;
      role?: string;
    }[];
    importance?: number; // 1-10 scale
    consequences?: string;
  };
}

// Note suggestion
export interface NoteSuggestion extends ContentSuggestion {
  type: SuggestionType.NOTE;
  noteData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    relatedEntities?: {
      id?: string;
      type?: string;
      name: string;
    }[];
  };
}

// Content analysis filter options
export interface ContentAnalysisFilterOptions {
  types?: SuggestionType[];
  status?: SuggestionStatus[];
  confidence?: ConfidenceLevel[];
  sourceId?: string;
  sourceType?: string;
  contextId?: string;
  contextType?: string;
  createdAfter?: number;
  createdBefore?: number;
  search?: string;
}

// Content analysis request
export interface ContentAnalysisRequest {
  sourceId?: string;
  sourceType?: string;
  contextId?: string;
  contextType?: string;
  content?: string;
  transcriptionId?: string;
  sessionId?: string;
  analysisTypes: SuggestionType[];
  options?: {
    maxResults?: number;
    minConfidence?: ConfidenceLevel;
    includeExisting?: boolean;
    model?: string;
    customPrompt?: string;
  };
}

// Content analysis result
export interface ContentAnalysisResult {
  id: string;
  requestId: string;
  suggestions: ContentSuggestion[];
  createdAt: number;
  processingTime: number;
  metadata?: {
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    error?: string;
  };
}

/**
 * Content analysis service for interacting with the content analysis API
 */
export const ContentAnalysisService = {
  /**
   * Get content suggestion by ID
   * @param id Suggestion ID
   * @returns Content suggestion
   */
  getSuggestion: async (id: string): Promise<ContentSuggestion> => {
    const response: AxiosResponse<{ success: boolean; data: ContentSuggestion }> = await apiClient.get(`/content-analysis/suggestions/${id}`);
    return response.data.data;
  },

  /**
   * Get all content suggestions with optional filtering
   * @param filter Filter options
   * @returns Content suggestions
   */
  getSuggestions: async (filter?: ContentAnalysisFilterOptions): Promise<ContentSuggestion[]> => {
    // Build query parameters
    const params: Record<string, string> = {};

    if (filter) {
      if (filter.types && filter.types.length > 0) {
        params.types = filter.types.join(',');
      }

      if (filter.status && filter.status.length > 0) {
        params.status = filter.status.join(',');
      }

      if (filter.confidence && filter.confidence.length > 0) {
        params.confidence = filter.confidence.join(',');
      }

      if (filter.sourceId) {
        params.sourceId = filter.sourceId;
      }

      if (filter.sourceType) {
        params.sourceType = filter.sourceType;
      }

      if (filter.contextId) {
        params.contextId = filter.contextId;
      }

      if (filter.contextType) {
        params.contextType = filter.contextType;
      }

      if (filter.createdAfter) {
        params.createdAfter = filter.createdAfter.toString();
      }

      if (filter.createdBefore) {
        params.createdBefore = filter.createdBefore.toString();
      }

      if (filter.search) {
        params.search = filter.search;
      }
    }

    const response: AxiosResponse<{ success: boolean; data: ContentSuggestion[] }> = await apiClient.get('/content-analysis/suggestions', {
      params
    });

    return response.data.data;
  },

  /**
   * Update content suggestion
   * @param id Suggestion ID
   * @param suggestion Updated suggestion data
   * @returns Updated suggestion
   */
  updateSuggestion: async (id: string, suggestion: Partial<Omit<ContentSuggestion, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ContentSuggestion> => {
    const response: AxiosResponse<{ success: boolean; data: ContentSuggestion }> = await apiClient.put(`/content-analysis/suggestions/${id}`, suggestion);
    return response.data.data;
  },

  /**
   * Delete content suggestion
   * @param id Suggestion ID
   * @returns Success message
   */
  deleteSuggestion: async (id: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.delete(`/content-analysis/suggestions/${id}`);
    return response.data.data;
  },

  /**
   * Accept content suggestion
   * @param id Suggestion ID
   * @returns Updated suggestion
   */
  acceptSuggestion: async (id: string): Promise<ContentSuggestion> => {
    const response: AxiosResponse<{ success: boolean; data: ContentSuggestion }> = await apiClient.post(`/content-analysis/suggestions/${id}/accept`);
    return response.data.data;
  },

  /**
   * Reject content suggestion
   * @param id Suggestion ID
   * @returns Updated suggestion
   */
  rejectSuggestion: async (id: string): Promise<ContentSuggestion> => {
    const response: AxiosResponse<{ success: boolean; data: ContentSuggestion }> = await apiClient.post(`/content-analysis/suggestions/${id}/reject`);
    return response.data.data;
  },

  /**
   * Modify content suggestion
   * @param id Suggestion ID
   * @param suggestion Updated suggestion data
   * @returns Updated suggestion
   */
  modifySuggestion: async (id: string, suggestion: Partial<Omit<ContentSuggestion, 'id' | 'createdAt' | 'updatedAt' | 'status'>>): Promise<ContentSuggestion> => {
    const response: AxiosResponse<{ success: boolean; data: ContentSuggestion }> = await apiClient.post(`/content-analysis/suggestions/${id}/modify`, suggestion);
    return response.data.data;
  },

  /**
   * Get content analysis result by ID
   * @param id Result ID
   * @returns Content analysis result
   */
  getAnalysisResult: async (id: string): Promise<ContentAnalysisResult> => {
    const response: AxiosResponse<{ success: boolean; data: ContentAnalysisResult }> = await apiClient.get(`/content-analysis/results/${id}`);
    return response.data.data;
  },

  /**
   * Get all content analysis results
   * @param contextId Optional context ID
   * @returns Content analysis results
   */
  getAnalysisResults: async (contextId?: string): Promise<ContentAnalysisResult[]> => {
    const params: Record<string, string> = {};

    if (contextId) {
      params.contextId = contextId;
    }

    const response: AxiosResponse<{ success: boolean; data: ContentAnalysisResult[] }> = await apiClient.get('/content-analysis/results', {
      params
    });

    return response.data.data;
  },

  /**
   * Delete content analysis result
   * @param id Result ID
   * @returns Success message
   */
  deleteAnalysisResult: async (id: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.delete(`/content-analysis/results/${id}`);
    return response.data.data;
  },

  /**
   * Analyze content and generate suggestions
   * @param request Analysis request
   * @returns Analysis result
   */
  analyzeContent: async (request: ContentAnalysisRequest): Promise<ContentAnalysisResult> => {
    const response: AxiosResponse<{ success: boolean; data: ContentAnalysisResult }> = await apiClient.post('/content-analysis/analyze', request);
    return response.data.data;
  }
};
