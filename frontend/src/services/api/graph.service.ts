import apiClient from './client';
import { AxiosResponse } from 'axios';

// Node types
export type NodeType = 'world' | 'campaign' | 'session' | 'character' | 'location' | 'item' | 'event' | 'power';

// Node interface
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  imageUrl?: string;
  properties?: Record<string, any>;
  annotation?: string;
}

// Edge types
export type EdgeType =
  'PART_OF' |
  'CONTAINS' |
  'LOCATED_AT' |
  'PARTICIPATED_IN' |
  'RELATED_TO' |
  'PARENT_OF' |
  'CHILD_OF' |
  'OWNS' |
  'CREATED' |
  'HAS_POWER' |
  'OCCURRED_AT';

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
  itemId?: string;
  eventId?: string;
  powerId?: string;
  depth?: number;
  nodeTypes?: NodeType[];
  edgeTypes?: EdgeType[];
  includeImages?: boolean;
  layout?: 'force' | 'hierarchy' | 'radial';
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
   * Get graph data for a specific item
   * @param itemId Item ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getItemGraph: async (itemId: string, params?: Omit<GraphQueryParams, 'itemId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ itemId, ...params });
  },

  /**
   * Get graph data for a specific event
   * @param eventId Event ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getEventGraph: async (eventId: string, params?: Omit<GraphQueryParams, 'eventId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ eventId, ...params });
  },

  /**
   * Get graph data for a specific power
   * @param powerId Power ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getPowerGraph: async (powerId: string, params?: Omit<GraphQueryParams, 'powerId'>): Promise<GraphData> => {
    return GraphService.getGraphData({ powerId, ...params });
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

  /**
   * Get hierarchy graph data for a specific world
   * @param worldId World ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getWorldHierarchyGraph: async (worldId: string, params?: Omit<GraphQueryParams, 'worldId'>): Promise<GraphData> => {
    const response: AxiosResponse<{ success: boolean; data: GraphData }> = await apiClient.get('/graph/hierarchy', { params: { worldId, ...params } });
    return response.data.data;
  },

  /**
   * Get hierarchy graph data for a specific campaign
   * @param campaignId Campaign ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  getCampaignHierarchyGraph: async (campaignId: string, params?: Omit<GraphQueryParams, 'campaignId'>): Promise<GraphData> => {
    const response: AxiosResponse<{ success: boolean; data: GraphData }> = await apiClient.get('/graph/hierarchy', { params: { campaignId, ...params } });
    return response.data.data;
  },
};

export default GraphService;
