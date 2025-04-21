import { GraphRepository } from '../repositories/graph.repository';
import { GraphData, GraphQueryParams } from '../models/graph.model';

/**
 * Service for graph data
 */
export class GraphService {
  private graphRepository: GraphRepository;

  constructor(graphRepository: GraphRepository) {
    this.graphRepository = graphRepository;
  }

  /**
   * Get mind map graph data
   * @param params Query parameters
   * @returns Graph data
   */
  public async getMindMapGraph(params: GraphQueryParams = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph(params);
    } catch (error) {
      console.error('Error getting mind map graph:', error);
      throw error;
    }
  }

  /**
   * Get hierarchy graph data
   * @param params Query parameters
   * @returns Graph data
   */
  public async getHierarchyGraph(params: GraphQueryParams = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getHierarchyGraph(params);
    } catch (error) {
      console.error('Error getting hierarchy graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific world
   * @param worldId World ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getWorldGraph(worldId: string, params: Omit<GraphQueryParams, 'worldId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, worldId });
    } catch (error) {
      console.error('Error getting world graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific campaign
   * @param campaignId Campaign ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getCampaignGraph(campaignId: string, params: Omit<GraphQueryParams, 'campaignId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, campaignId });
    } catch (error) {
      console.error('Error getting campaign graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific session
   * @param sessionId Session ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getSessionGraph(sessionId: string, params: Omit<GraphQueryParams, 'sessionId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, sessionId });
    } catch (error) {
      console.error('Error getting session graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific character
   * @param characterId Character ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getCharacterGraph(characterId: string, params: Omit<GraphQueryParams, 'characterId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, characterId });
    } catch (error) {
      console.error('Error getting character graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific location
   * @param locationId Location ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getLocationGraph(locationId: string, params: Omit<GraphQueryParams, 'locationId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, locationId });
    } catch (error) {
      console.error('Error getting location graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific item
   * @param itemId Item ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getItemGraph(itemId: string, params: Omit<GraphQueryParams, 'itemId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, itemId });
    } catch (error) {
      console.error('Error getting item graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific event
   * @param eventId Event ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getEventGraph(eventId: string, params: Omit<GraphQueryParams, 'eventId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, eventId });
    } catch (error) {
      console.error('Error getting event graph:', error);
      throw error;
    }
  }

  /**
   * Get graph data for a specific power
   * @param powerId Power ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getPowerGraph(powerId: string, params: Omit<GraphQueryParams, 'powerId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getMindMapGraph({ ...params, powerId });
    } catch (error) {
      console.error('Error getting power graph:', error);
      throw error;
    }
  }

  /**
   * Get hierarchy graph data for a specific world
   * @param worldId World ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getWorldHierarchyGraph(worldId: string, params: Omit<GraphQueryParams, 'worldId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getHierarchyGraph({ ...params, worldId });
    } catch (error) {
      console.error('Error getting world hierarchy graph:', error);
      throw error;
    }
  }

  /**
   * Get hierarchy graph data for a specific campaign
   * @param campaignId Campaign ID
   * @param params Additional query parameters
   * @returns Graph data
   */
  public async getCampaignHierarchyGraph(campaignId: string, params: Omit<GraphQueryParams, 'campaignId'> = {}): Promise<GraphData> {
    try {
      return await this.graphRepository.getHierarchyGraph({ ...params, campaignId });
    } catch (error) {
      console.error('Error getting campaign hierarchy graph:', error);
      throw error;
    }
  }
}
