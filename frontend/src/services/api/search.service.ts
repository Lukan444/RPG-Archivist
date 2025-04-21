import apiClient from './client';
import { AxiosResponse } from 'axios';

// Entity types
export type EntityType = 'world' | 'campaign' | 'session' | 'character' | 'location' | 'item' | 'event';

// Search result interface
export interface SearchResult {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parentName?: string;
  parentType?: EntityType;
  createdAt: string;
  updatedAt: string;
  highlights?: {
    field: string;
    text: string;
  }[];
}

// Search query parameters
export interface SearchParams {
  query: string;
  types?: EntityType[];
  worldId?: string;
  campaignId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'name' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

// Search service
const SearchService = {
  /**
   * Search for entities
   * @param params Search parameters
   * @returns Search results
   */
  search: async (params: SearchParams): Promise<{ results: SearchResult[]; total: number }> => {
    const response: AxiosResponse<{ success: boolean; data: { results: SearchResult[]; total: number } }> = 
      await apiClient.get('/search', { params });
    return response.data.data;
  },

  /**
   * Get search suggestions based on partial query
   * @param query Partial search query
   * @param types Entity types to include
   * @returns Search suggestions
   */
  getSuggestions: async (query: string, types?: EntityType[]): Promise<string[]> => {
    const response: AxiosResponse<{ success: boolean; data: string[] }> = 
      await apiClient.get('/search/suggestions', { params: { query, types } });
    return response.data.data;
  },

  /**
   * Get recent searches
   * @param limit Maximum number of recent searches to return
   * @returns Recent searches
   */
  getRecentSearches: async (limit: number = 10): Promise<string[]> => {
    const response: AxiosResponse<{ success: boolean; data: string[] }> = 
      await apiClient.get('/search/recent', { params: { limit } });
    return response.data.data;
  },

  /**
   * Save a search query to recent searches
   * @param query Search query
   * @returns Success status
   */
  saveRecentSearch: async (query: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = 
      await apiClient.post('/search/recent', { query });
    return response.data.success;
  },

  /**
   * Clear recent searches
   * @returns Success status
   */
  clearRecentSearches: async (): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = 
      await apiClient.delete('/search/recent');
    return response.data.success;
  },
};

export default SearchService;
