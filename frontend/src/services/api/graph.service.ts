import apiClient from './client';
import { AxiosResponse } from 'axios';

// Node types
export type NodeType = 'world' | 'campaign' | 'session' | 'character' | 'location';

// Node interface
export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  imageUrl?: string;
  properties?: Record<string, any>;
}

// Edge types
export type EdgeType = 
  'PART_OF' | 
  'CONTAINS' | 
  'LOCATED_AT' | 
  'PARTICIPATED_IN' | 
  'RELATED_TO' | 
  'PARENT_OF' | 
  'CHILD_OF';

// Edge interface
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  properties?: Record<string, any>;
}

// Graph data interface
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Graph query parameters
export interface GraphQueryParams {
  worldId?: string;
  campaignId?: string;
  sessionId?: string;
  characterId?: string;
  locationId?: string;
  depth?: number;
  includeTypes?: NodeType[];
  excludeTypes?: NodeType[];
  includeRelations?: EdgeType[];
  excludeRelations?: EdgeType[];
  limit?: number;
}

// Graph service
const GraphService = {
  /**
   * Get graph data for visualization
   * @param params Query parameters
   * @returns Graph data
   */
  getGraphData: async (params: GraphQueryParams): Promise<GraphData> => {
    const response: AxiosResponse<{ success: boolean; data: GraphData }> = await apiClient.get('/graph', { params });
    return response.data.data;
  },

  /**
   * Get graph data for a specific world
   * @param worldId World ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getWorldGraph: async (worldId: string, params?: Omit<GraphQueryParams, 'worldId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ worldId, ...params });
  },

  /**
   * Get graph data for a specific campaign
   * @param campaignId Campaign ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getCampaignGraph: async (campaignId: string, params?: Omit<GraphQueryParams, 'campaignId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ campaignId, ...params });
  },

  /**
   * Get graph data for a specific session
   * @param sessionId Session ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getSessionGraph: async (sessionId: string, params?: Omit<GraphQueryParams, 'sessionId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ sessionId, ...params });
  },

  /**
   * Get graph data for a specific character
   * @param characterId Character ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getCharacterGraph: async (characterId: string, params?: Omit<GraphQueryParams, 'characterId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ characterId, ...params });
  },

  /**
   * Get graph data for a specific location
   * @param locationId Location ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getLocationGraph: async (locationId: string, params?: Omit<GraphQueryParams, 'locationId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ locationId, ...params });
  },

  /**
   * Get graph data for the mind map
   * @param params Query parameters
   * @returns Graph data
   */
  getMindMapGraph: async (params?: GraphQueryParams): Promise<GraphData> => {
    const response: AxiosResponse<{ success: boolean; data: GraphData }> = await apiClient.get('/graph/mind-map', { params });
    return response.data.data;
  },

  /**
   * Get graph data for hierarchical view
   * @param params Query parameters
   * @returns Graph data
   */
  getHierarchyGraph: async (params?: GraphQueryParams): Promise<GraphData> => {
    const response: AxiosResponse<{ success: boolean; data: GraphData }> = await apiClient.get('/graph/hierarchy', { params });
    return response.data.data;
  },
};

export default GraphService;
